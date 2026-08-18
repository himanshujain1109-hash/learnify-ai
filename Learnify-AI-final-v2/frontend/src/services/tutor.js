import api from "./api";
export const askTutor = async (documentId, question) =>
  (await api.post("/tutor/ask", { documentId, question })).data;