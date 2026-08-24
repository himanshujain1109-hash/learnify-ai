import api from "./api";

export const getQuiz = async (lessonId) => {
  const response = await api.get(
    `/quiz/generate?lessonId=${encodeURIComponent(lessonId)}`
  );

  return response.data;
};

export const submitQuiz = async (quizId, answers) => {
  const response = await api.post("/quiz/submit", {
    quizId,
    answers,
  });

  return response.data;
};
