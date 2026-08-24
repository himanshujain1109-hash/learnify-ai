import api from "./api";

export const getQuiz = async (lessonId) => {
  if (!lessonId) {
    throw new Error("Lesson ID is required");
  }

  const response = await api.get(
    `/api/quiz/generate?lessonId=${encodeURIComponent(lessonId)}`
  );

  return response.data;
};

export const submitQuiz = async (quizId, answers) => {
  if (!quizId) {
    throw new Error("Quiz ID is required");
  }

  const response = await api.post(
    "/api/quiz/submit",
    {
      quizId,
      answers,
    }
  );

  return response.data;
};
