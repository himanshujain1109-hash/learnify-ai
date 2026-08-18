import bcrypt from "bcryptjs";
import User from "../../backend/models/User.js";
import connectDB from "../../backend/lib/db.js";
import { sendError, setCors } from "../_utils.js";

export default async function handler(req,res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    if(req.method!=="POST") return res.status(405).json({message:"Method not allowed"});
    await connectDB();
    const {name,email,password}=req.body||{};
    if(!name||!email||!password) return res.status(400).json({message:"Name, email and password are required"});
    if(password.length<6) return res.status(400).json({message:"Password must be at least 6 characters"});
    const exists=await User.findOne({email:email.toLowerCase()});
    if(exists) return res.status(409).json({message:"Email is already registered"});
    const hash=await bcrypt.hash(password,10);
    const user=await User.create({name,email:email.toLowerCase(),password:hash});
    return res.status(201).json({message:"Registration successful",user:{id:user._id,name:user.name,email:user.email}});
  } catch(e){return sendError(res,e);}
}