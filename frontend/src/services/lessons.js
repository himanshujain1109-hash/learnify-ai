import api from "./api";
export const generateLesson=async topicId=>(await api.post("/lessons/generate",{topicId})).data;
export const getLesson=async id=>(await api.get(`/lessons/${id}`)).data;
