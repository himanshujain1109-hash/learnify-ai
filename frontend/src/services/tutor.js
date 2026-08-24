import api from "./api";

export const askTutor = async (question, context = "") => {
  const response = await api.post(
    "/api/tutor/ask",
    {
      question,
      context,
    }
  );

  return response.data;
};
