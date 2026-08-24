import connectDB from "../../backend/lib/db.js";
import Quiz from "../../backend/models/Quiz.js";
import Lesson from "../../backend/models/Lesson.js";
import Document from "../../backend/models/Document.js";
import Progress from "../../backend/models/Progress.js";
import { requireAuth } from "../../backend/lib/auth.js";
import { sendError, setCors } from "../_utils.js";

export default async function handler(req,res){
  setCors(res, req);
  if (req.method === "OPTIONS") return res.status(204).end();
  try{
    if(req.method!=="POST")return res.status(405).json({message:"Method not allowed"});
    const {userId}=requireAuth(req); await connectDB();
    const {quizId,answers={}}=req.body||{};
    const quiz=await Quiz.findById(quizId).lean();
    if(!quiz)return res.status(404).json({message:"Quiz not found"});
    const lesson=await Lesson.findById(quiz.lessonId).lean();
    const doc=await Document.findOne({_id:lesson.documentId,userId});
    if(!doc)return res.status(403).json({message:"Not allowed"});
    let score=0;
    quiz.questions.forEach((q,i)=>{if(Number(answers[i])===Number(q.answerIndex))score++;});
    await Progress.findOneAndUpdate({userId,lessonId:lesson._id},{userId,lessonId:lesson._id,quizScore:score,completed:score>=Math.ceil(quiz.questions.length*.6)},{upsert:true,new:true});
    return res.json({score,total:quiz.questions.length});
  }catch(e){return sendError(res,e);}
}