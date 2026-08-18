import api from "./api";

export const generateLesson = async (topicId) => {
  const response = await api.post("/api/lessons/generate", {
    topicId,
  });

  return response.data;
};

export const getLesson = async (id) => {
  const response = await api.get(`/api/lessons/${id}`);

  return response.data;
};
