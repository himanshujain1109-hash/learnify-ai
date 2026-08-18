import api from "./api";
export const getQuiz = async (lessonId) => (await api.get(`/quiz/generate?lessonId=${lessonId}`)).data;
export const submitQuiz = async (quizId, answers) => (await api.post("/quiz/submit", { quizId, answers })).data;