import api from "./api";

export const getQuiz = async (lessonId) => {
  const response = await api.get(
    `/api/quiz/generate?lessonId=${encodeURIComponent(lessonId)}`
  );

  return response.data;
};

export const submitQuiz = async (quizId, answers) => {
  const response = await api.post("/api/quiz/submit", {
    quizId,
    answers,
  });

  return response.data;
};
