import api from "./api";

export const generateLesson = async (topicId) => {
  const response = await api.post("/lessons/generate", {
    topicId,
  });

  return response.data;
};

export const getLesson = async (id) => {
  const response = await api.get(`/lessons/${id}`);
  return response.data;
};
