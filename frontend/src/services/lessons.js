import api from "./api";

export const generateLesson = async (topicId) => {
  if (!topicId) {
    throw new Error("Topic ID is required");
  }

  const response = await api.post(
    "/api/lessons/generate",
    {
      topicId,
    }
  );

  return response.data;
};

export const getLesson = async (id) => {
  if (!id) {
    throw new Error("Lesson ID is required");
  }

  const response = await api.get(
    `/api/lessons/${encodeURIComponent(id)}`
  );

  return response.data;
};
