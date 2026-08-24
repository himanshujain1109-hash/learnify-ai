import api from "./api";

export const getMaterials = async () => {
  const response = await api.get("/api/materials");

  return response.data;
};

export const getMaterial = async (id) => {
  const response = await api.get(`/api/materials/${id}`);

  return response.data;
};

export const uploadMaterial = async (file, title) => {
  const form = new FormData();

  form.append("file", file);

  if (title) {
    form.append("title", title);
  }

  const response = await api.post("/api/materials/upload", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
