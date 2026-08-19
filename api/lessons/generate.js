import connectDB from "../../backend/lib/db.js";
import Document from "../../backend/models/Document.js";
import Topic from "../../backend/models/Topic.js";
import Lesson from "../../backend/models/Lesson.js";
import { requireAuth } from "../../backend/lib/auth.js";
import { generateJSON } from "../../backend/lib/gemini.js";
import { sendError, setCors } from "../_utils.js";

export default async function handler(req,res){
  setCors(res, req);
  if (req.method === "OPTIONS") return res.status(204).end();
  try{
    if(req.method!=="POST")return res.status(405).json({message:"Method not allowed"});
    const {userId}=requireAuth(req); await connectDB();
    const {topicId}=req.body||{};
    const topic=await Topic.findById(topicId);
    if(!topic)return res.status(404).json({message:"Topic not found"});
    const doc=await Document.findOne({_id:topic.documentId,userId});
    if(!doc)return res.status(403).json({message:"Not allowed"});
    const existing=await Lesson.findOne({topicId});
    if(existing)return res.json({lesson:existing});
    const prompt=`You are a patient college teacher. Create a beginner-friendly lesson from the supplied material. Return ONLY JSON with keys: title, introduction, explanation, realLifeExample, importantPoints (array), examPoints (array), summary, difficulty, quiz (array of objects with question, options array of 4 strings, answerIndex number, explanation). Do not invent facts. Topic: ${topic.title}. Material: ${doc.extractedText.slice(0,50000)}`;
    const data=await generateJSON(prompt);
    const lesson=await Lesson.create({...data,topicId:topic._id,documentId:doc._id});
    return res.status(201).json({lesson});
  }catch(e){return sendError(res,e);}
}