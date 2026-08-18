import bcrypt from "bcryptjs";
import User from "../../backend/models/User.js";
import connectDB from "../../backend/lib/db.js";
import { signToken } from "../../backend/lib/auth.js";
import { sendError, setCors } from "../_utils.js";

export default async function handler(req,res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    if(req.method!=="POST") return res.status(405).json({message:"Method not allowed"});
    await connectDB();
    const {email,password}=req.body||{};
    const user=await User.findOne({email:email?.toLowerCase()});
    if(!user || !(await bcrypt.compare(password||"",user.password))) return res.status(401).json({message:"Invalid credentials"});
    const token=signToken(user._id.toString());
    return res.json({token,user:{id:user._id,name:user.name,email:user.email}});
  } catch(e){return sendError(res,e);}
}