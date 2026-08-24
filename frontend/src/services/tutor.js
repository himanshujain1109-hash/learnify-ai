import api from "./api";

export const askTutor = async (documentId, question) => {
  const response = await api.post("/api/tutor/ask", {
    documentId,
    question,
  });

  return response.data;
};
