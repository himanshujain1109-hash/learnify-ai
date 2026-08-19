import connectDB from "../../backend/lib/db.js";
import Progress from "../../backend/models/Progress.js";
import { requireAuth } from "../../backend/lib/auth.js";
import { sendError, setCors } from "../_utils.js";

export default async function handler(req,res){
  setCors(res, req);
  if (req.method === "OPTIONS") return res.status(204).end();
  try{
    if(req.method!=="GET")return res.status(405).json({message:"Method not allowed"});
    const {userId}=requireAuth(req); await connectDB();
    const progress=await Progress.find({userId}).sort({updatedAt:-1}).lean();
    return res.json({progress});
  }catch(e){return sendError(res,e);}
}