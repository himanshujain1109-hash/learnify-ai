import api from "./api";

export const getMaterials = async () => (await api.get("/materials")).data;

export const getMaterial = async (id) => (await api.get(`/materials/${id}`)).data;

export const uploadMaterial = async (file, title) => {
  const form = new FormData();
  form.append("file", file);
  if (title) form.append("title", title);
  return (await api.post("/materials/upload", form)).data;
};