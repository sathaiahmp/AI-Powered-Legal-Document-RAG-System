import { api } from "./client";

export async function fetchAnalytics(sessionId: string) {
  const res = await api.get("/analytics", { params: { sessionId } });
  return res.data as { sessionId: string; intents: Record<string, number>; totalQueries: number; averageConfidence: number; lastUpdated: string };
}
