from langchain_core.messages import HumanMessage, AIMessage

class SimpleChatMemory:
    def __init__(self, k=5):
        self.messages = []
        self.k = k

    def add_user_message(self, msg):
        self.messages.append(HumanMessage(content=msg))
        self._trim()

    def add_ai_message(self, msg):
        self.messages.append(AIMessage(content=msg))
        self._trim()

    def _trim(self):
        if len(self.messages) > self.k * 2:
            self.messages = self.messages[-(self.k * 2):]

class SimpleMemory:
    def __init__(self, memory_key="chat_history", return_messages=True, k=5):
        self.chat_memory = SimpleChatMemory(k=k)
