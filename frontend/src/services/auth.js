import api from "./api";

export const registerUser = async (data) => (await api.post("/auth/register", data)).data;
export const loginUser = async (data) => (await api.post("/auth/login", data)).data;