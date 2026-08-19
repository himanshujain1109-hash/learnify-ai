import multer from "multer";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs/promises";
import Document from "../../backend/models/Document.js";
import Topic from "../../backend/models/Topic.js";
import Lesson from "../../backend/models/Lesson.js";
import connectDB from "../../backend/lib/db.js";
import { requireAuth } from "../../backend/lib/auth.js";
import { generateJSON } from "../../backend/lib/gemini.js";
import { sendError, setCors } from "../_utils.js";

const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:(Number(process.env.MAX_UPLOAD_MB)||10)*1024*1024}});

function runMulter(req,res){return new Promise((resolve,reject)=>upload.single("file")(req,res,e=>e?reject(e):resolve()));}

async function extract(file){
  const name=file.originalname.toLowerCase();
  if(name.endsWith(".pdf")) return (await pdfParse(file.buffer)).text;
  if(name.endsWith(".txt")) return file.buffer.toString("utf8");
  if(name.endsWith(".docx")) return (await mammoth.extractRawText({buffer:file.buffer})).value;
  throw Object.assign(new Error("Only PDF, DOCX and TXT files are supported"),{statusCode:400});
}

export default async function handler(req,res){
  setCors(res, req);
  if (req.method === "OPTIONS") return res.status(204).end();
  try{
    if(req.method!=="POST")return res.status(405).json({message:"Method not allowed"});
    const {userId}=requireAuth(req); await runMulter(req,res);
    if(!req.file)return res.status(400).json({message:"File is required"});
    const text=(await extract(req.file)).replace(/\s+/g," ").trim();
    if(!text)return res.status(400).json({message:"Could not extract text"});
    await connectDB();
    const title=req.body?.title?.trim() || req.file.originalname.replace(/\.[^.]+$/,"");
    const material=await Document.create({userId,title,originalFileName:req.file.originalname,extractedText:text,status:"processing"});
    const prompt=`You are an expert college professor. Analyze this academic material and identify 3 to 12 major teachable topics. Return ONLY JSON in this shape: {"topics":[{"title":"...","description":"...","order":1,"difficulty":"Beginner|College|Advanced"}]}. Do not invent topics not supported by the material. Material:\\n${text.slice(0,50000)}`;
    const result=await generateJSON(prompt);
    const topics=await Topic.insertMany((result.topics||[]).map(t=>({...t,documentId:material._id})));
    material.status="completed"; await material.save();
    return res.status(201).json({material:{_id:material._id,title:material.title,originalFileName:material.originalFileName,status:material.status},topics});
  }catch(e){return sendError(res,e);}
}