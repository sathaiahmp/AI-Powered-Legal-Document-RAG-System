# enhanced_rag_pipeline.py - Advanced RAG with Legal Specialization
import os
import json
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from src.custom_memory import SimpleMemory as ConversationBufferWindowMemory
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging
import google.generativeai as genai

# Import the Config class
from src.config import Config

# Configure logging
logger = logging.getLogger(__name__)

class LegalRAGPipeline:
    def __init__(self, config: Config):
        self.config = config
        self._initialize_llm()
        self.memory = ConversationBufferWindowMemory(
            memory_key="chat_history",
            return_messages=True,
            k=5  # Keep last 5 exchanges
        )
        self.legal_prompts = self._load_legal_prompts()
    
    def _initialize_llm(self):
        """Initialize LLM client"""
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not self.gemini_api_key:
            logger.warning(
                "GEMINI_API_KEY not set. Gemini calls will fail until the environment variable is provided."
            )
        else:
            genai.configure(api_key=self.gemini_api_key)

        self.model_name = self.config.GEMINI_MODEL_NAME
    
    def _call_gemini_api(self, messages: List[Dict[str, str]], documents: Optional[List[Document]] = None) -> str:
        """Call Gemini API directly."""
        if not self.gemini_api_key:
            logger.error("Attempted to call Gemini API but GEMINI_API_KEY is not configured.")
            return "GEMINI_API_KEY not configured on the server. Set GEMINI_API_KEY environment variable to enable LLM responses."
        
        # Prepare content for Gemini
        # Gemini expects a specific format or just a prompt string.
        # We'll combine system and user messages into a single prompt for simplicity with the generative model,
        # or use the chat session if we want to maintain history properly (but here we are doing single turn with memory managed manually).
        
        system_instruction = messages[0]["content"] if messages and messages[0]["role"] == "system" else ""
        user_message = messages[-1]["content"] if messages else ""
        
        full_prompt = f"{system_instruction}\n\nUser: {user_message}"

        models_to_try = [self.model_name]
        if self.config.SUPPORTED_GEMINI_MODELS:
            for m in self.config.SUPPORTED_GEMINI_MODELS:
                if m not in models_to_try:
                    models_to_try.append(m)
        
        last_err = None
        
        for model in models_to_try:
            logger.info("Attempting Gemini model: %s", model)
            try:
                generative_model = genai.GenerativeModel(model)
                response = generative_model.generate_content(full_prompt)
                return response.text
            except Exception as e:
                last_err = e
                logger.warning("Gemini model %s failed: %s", model, str(e))
                continue

        # If we reach here, all Gemini attempts have failed.
        logger.error("All Gemini model attempts failed; last error: %s", str(last_err))
        if documents:
            try:
                context = self._prepare_context(documents)
                fallback = (
                    "Gemini LLM is currently unavailable. "
                    "Returning the top retrieved passages as an extractive fallback:\n\n"
                    f"{context}"
                )
                return fallback
            except Exception as e:
                logger.error("Failed to build extractive fallback: %s", str(e))

        return f"Error generating response: {str(last_err)}"
        
    
    def _load_legal_prompts(self) -> Dict[str, str]:
        """Legal domain-specific prompts"""
        return {
            "general": """
            You are an expert legal AI assistant specializing in Indian law. 
            
            CRITICAL INSTRUCTIONS:
            1. You must ONLY answer questions related to law, legal procedures, contracts, compliance, legal rights, and judiciary matters.
            2. If the user asks a question unrelated to law (e.g., general trivia, coding, math, lifestyle), politely REFUSE to answer and state: "I am a specialized legal AI assistant and can only answer questions related to legal matters."
            3. If context from documents is provided, prioritize it.
            4. If NO context is provided, answer based on your general legal knowledge, but strictly adhere to the legal-only constraint.
            
            Response Format:
            **Answer**: [Direct, brief answer to the question]
            
            **Key Points**:
            • [Point 1]
            • [Point 2]
            • [Point 3]
            
            **Legal Context**: [Brief explanation of relevant legal principles]
            
            **Recommendations**: [Actionable advice if applicable]
            
            Guidelines:
            - Keep responses concise and well-structured
            - Use bullet points for clarity
            - Cite specific clauses/sections when possible (e.g., IPC, CrPC, Contract Act, Constitution Articles)
            - Highlight risks or important considerations
            - You have access to knowledge about:
              * Legal Forms (Agreements, Affidavits, Notices)
              * Indian Constitution (Articles, Fundamental Rights)
              * Major Acts (IPC, CrPC, Evidence Act, Consumer Protection, IT Act)
            - Use this knowledge to answer specific questions about formats or sections.
            
            Context: {context}
            Question: {question}
            
            Response:
            """,
            
            "contract_analysis": """
            As a contract law expert, provide a structured contract analysis:
            
            **Contract Type**: [Type of contract and main purpose]
            
            **Key Parties**: [Main parties and their roles]
            
            **Critical Terms**:
            • [Key obligation 1]
            • [Key obligation 2]
            • [Payment/termination terms]
            
            **Risk Assessment**:
            • [High-risk clause 1]
            • [Liability concern 2]
            • [Enforcement issue 3]
            
            **Compliance Status**: [Missing elements or violations]
            
            **Recommendations**: [Actionable improvements]
            
            Guidelines:
            - Focus on practical implications
            - Highlight critical risks
            - Provide specific recommendations
            - Keep analysis concise and actionable
            
            Context: {context}
            Question: {question}
            
            Analysis:
            """,
            
            "compliance_check": """
            Perform a structured compliance analysis:
            
            **Compliance Status**: [Overall compliance rating]
            
            **Required Elements Present**:
            • [Mandatory clause 1]
            • [Mandatory clause 2]
            • [Legal requirement 3]
            
            **Missing Elements**:
            • [Missing clause 1]
            • [Missing clause 2]
            
            **Violations Found**:
            • [Violation 1 with specific reference]
            • [Violation 2 with specific reference]
            
            **Recommendations**: [Specific actions to achieve compliance]
            
            Guidelines:
            - Focus on actionable compliance issues
            - Cite specific legal requirements
            - Prioritize critical violations
            - Provide clear remediation steps
            
            Context: {context}
            Question: {question}
            
            Compliance Report:
            """,
            
            "risk_assessment": """
            Conduct a structured risk assessment:
            
            **Risk Level**: [Overall risk rating: Low/Medium/High]
            
            **High-Risk Areas**:
            • [Risk 1 with potential impact]
            • [Risk 2 with potential impact]
            • [Risk 3 with potential impact]
            
            **Enforcement Concerns**:
            • [Enforceability issue 1]
            • [Enforceability issue 2]
            
            **Mitigation Strategies**:
            • [Strategy 1 to reduce risk]
            • [Strategy 2 to reduce risk]
            
            **Recommendations**: [Priority actions to address risks]
            
            Guidelines:
            - Focus on practical risk mitigation
            - Quantify potential impacts where possible
            - Provide specific, actionable recommendations
            - Prioritize risks by severity
            
            Context: {context}
            Question: {question}
            
            Risk Assessment:
            """
        }
    
    def detect_query_intent(self, query: str) -> str:
        """Detect the intent of user query"""
        query_lower = query.lower()
        
        intent_patterns = {
            "contract_analysis": ["analyze contract", "contract terms", "obligations", "clauses"],
            "compliance_check": ["compliance", "regulatory", "legal requirements", "violations"],
            "risk_assessment": ["risks", "risk assessment", "vulnerabilities", "issues"],
            "summary": ["summarize", "summary", "overview", "brief"]
        }
        
        for intent, patterns in intent_patterns.items():
            if any(pattern in query_lower for pattern in patterns):
                return intent
        
        return "general"
    
    def generate_response(self, query: str, documents: List[Document], 
                         intent: Optional[str] = None) -> Dict[str, Any]:
        """Generate contextual response with metadata"""
        
        # Auto-detect intent if not provided
        if not intent:
            intent = self.detect_query_intent(query)

        # Prepare context
        if documents:
            context = self._prepare_context(documents)
        else:
            context = "No specific document context provided. Answer based on your general legal knowledge."

        chat_history = self.memory.chat_memory.messages
        
        # Select appropriate prompt
        prompt_template = self.legal_prompts.get(intent, self.legal_prompts["general"])
        # prompt = ChatPromptTemplate.from_template(prompt_template) # Not strictly needed if we format manually
        
        # Generate response
        try:
            # Prepare messages for Gemini API
            # We format the prompt template with context and question
            formatted_prompt = prompt_template.format(
                context=context,
                question=query,
                chat_history=chat_history
            )
            
            messages = [
                {"role": "system", "content": formatted_prompt}
            ]
            
            response = self._call_gemini_api(messages, documents=documents)
            
            # Update memory
            self.memory.chat_memory.add_user_message(query)
            self.memory.chat_memory.add_ai_message(response)
            
            return {
                "answer": response,
                "sources": [doc.metadata for doc in documents] if documents else [],
                "intent": intent,
                "confidence": self._calculate_confidence(documents),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return {
                "answer": f"I encountered an error processing your request: {str(e)}",
                "sources": [],
                "intent": "error",
                "confidence": 0.0,
                "timestamp": datetime.now().isoformat()
            }
    
    def _prepare_context(self, documents: List[Document]) -> str:
        """Prepare enhanced context with metadata"""
        context_parts = []
        
        for i, doc in enumerate(documents, 1):
            metadata = doc.metadata
            source_info = f"Source: {metadata.get('source', 'Unknown')}"
            doc_type = f"Type: {metadata.get('document_type', 'general_legal')}"
            
            # Truncate content to avoid payload size issues
            content = doc.page_content
            if len(content) > 1000:  # Limit each document to 1000 characters
                content = content[:1000] + "..."
            
            context_parts.append(f"[Document {i}]\n{source_info} | {doc_type}\n{content}\n")
        
        return "\n---\n".join(context_parts)
    
    def _calculate_confidence(self, documents: List[Document]) -> float:
        """Calculate confidence score based on retrieval quality"""
        if not documents:
            return 0.0
        
        # Simple confidence based on similarity scores and document count
        scores = [doc.metadata.get("similarity_score", 0.0) for doc in documents]
        # Similarity score from FAISS is distance, lower is better. Convert to confidence (0-1, higher is better)
        # Assuming scores are L2 distances, they can be > 1. Let's create a simple inverse mapping.
        confidence_scores = [max(0, 1 - score / 2) for score in scores] # Normalize roughly
        avg_confidence = sum(confidence_scores) / len(confidence_scores)

        doc_count_factor = min(len(documents) / self.config.RETRIEVAL_K, 1.0)
        
        return min(avg_confidence * doc_count_factor, 1.0)
    
    def generate_summary(self, documents: List[Document], summary_type: str = "comprehensive") -> str:
        """Generate document summary with different detail levels"""
        if not documents:
            return "No documents available for summarization."
        
        summary_prompts = {
            "brief": "Provide a concise 2-3 sentence summary focusing on the main purpose and key points:",
            "comprehensive": "Provide a structured summary with: 1) Document purpose, 2) Key obligations/rights, 3) Critical terms, 4) Important deadlines. Use bullet points for clarity:",
            "executive": "Provide an executive summary focusing on: 1) Business impact, 2) Key risks, 3) Critical obligations, 4) Action items. Keep it brief and actionable:"
        }
        
        context = self._prepare_context(documents)
        prompt_text = f"""
        {summary_prompts.get(summary_type, summary_prompts["comprehensive"])}
        
        Document Content:
        {context}
        
        Summary:
        """
        
        try:
            messages = [
                {"role": "system", "content": prompt_text}
            ]
            
            return self._call_gemini_api(messages, documents=documents)
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            return f"Error generating summary: {str(e)}"