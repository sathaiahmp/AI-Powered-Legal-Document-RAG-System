import { api, apiForm } from "./client";

export type AnalyzeType = "Q&A" | "Contract Analysis" | "Compliance Check" | "Risk Assessment";

export async function uploadDocument(file: File, sessionId?: string) {
  const form = new FormData();
  form.append("file", file);
  if (sessionId) form.append("sessionId", sessionId);

  const res = await apiForm.post("/upload", form);
  return res.data as { docId: string; name: string; size: number; message: string };
}

export async function analyzeQuery(
  query: string,
  analysisType?: AnalyzeType,
  docType?: string,
  sessionId?: string,
  docId?: string
) {
  const res = await api.post("/analyze", {
    query,
    analysisType,
    docType,
    sessionId,
    docId,
  });
  return res.data as { answer: string; intent: string; confidence: number; sources: any[]; timestamp: string };
}

export async function getSummary(docId: string, summaryType: "brief" | "comprehensive" | "executive" = "comprehensive") {
  const res = await api.get("/summary", { params: { docId, summaryType } });
  return res.data as { docId: string; summary: string };
}

export async function getAnalytics(sessionId: string) {
  const res = await api.get("/analytics", { params: { sessionId } });
  return res.data as { sessionId: string; intents: Record<string, number>; totalQueries: number; averageConfidence: number; lastUpdated: string };
}
