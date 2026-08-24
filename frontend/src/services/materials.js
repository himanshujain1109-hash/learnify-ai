import api from "./api";

export const getMaterials = async () => {
  const response = await api.get("/api/materials");
  return response.data;
};

export const getMaterial = async (id) => {
  if (!id) {
    throw new Error("Material ID is missing");
  }

  const response = await api.get(
    `/api/materials/${encodeURIComponent(id)}`
  );

  return response.data;
};

export const uploadMaterial = async (file, title) => {
  if (!file) {
    throw new Error("Please select a file");
  }

  const form = new FormData();

  form.append("file", file);

  if (title && title.trim()) {
    form.append("title", title.trim());
  }

  const response = await api.post(
    "/api/materials/upload",
    form
  );

  return response.data;
};
