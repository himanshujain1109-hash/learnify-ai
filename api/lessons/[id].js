import connectDB from "../../backend/lib/db.js";
import Lesson from "../../backend/models/Lesson.js";
import Document from "../../backend/models/Document.js";
import { requireAuth } from "../../backend/lib/auth.js";
import { sendError, setCors } from "../_utils.js";

export default async function handler(req,res){
  setCors(res, req);
  if (req.method === "OPTIONS") return res.status(204).end();
  try{
    const {userId}=requireAuth(req); await connectDB();
    const lesson=await Lesson.findById(req.query.id).lean();
    if(!lesson)return res.status(404).json({message:"Lesson not found"});
    const doc=await Document.findOne({_id:lesson.documentId,userId});
    if(!doc)return res.status(403).json({message:"Not allowed"});
    return res.json({lesson});
  }catch(e){return sendError(res,e);}
}