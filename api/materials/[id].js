import connectDB from "../../backend/lib/db.js";
import Document from "../../backend/models/Document.js";
import Topic from "../../backend/models/Topic.js";
import Lesson from "../../backend/models/Lesson.js";
import { requireAuth } from "../../backend/lib/auth.js";
import { sendError, setCors } from "../_utils.js";

export default async function handler(req,res){
  setCors(res, req);
  if (req.method === "OPTIONS") return res.status(204).end();
  try{
    const {userId}=requireAuth(req); await connectDB();
    const id=req.query.id;
    const material=await Document.findOne({_id:id,userId}).select("-extractedText").lean();
    if(!material)return res.status(404).json({message:"Material not found"});
    const topics=await Topic.find({documentId:id}).sort({order:1}).lean();
    const lessons=await Lesson.find({documentId:id}).select("_id topicId title").lean();
    const merged=topics.map(t=>({...t,lessonId:lessons.find(l=>String(l.topicId)===String(t._id))?._id}));
    return res.json({material,topics:merged});
  }catch(e){return sendError(res,e);}
}