import bcrypt from "bcryptjs";
import User from "../../backend/models/User.js";
import connectDB from "../../backend/lib/db.js";
import { sendError, setCors } from "../_utils.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req,res) {
  setCors(res, req);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    if(req.method!=="POST") return res.status(405).json({message:"Method not allowed"});

    const body = req.body || {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if(!name||!email||!password) return res.status(400).json({message:"Name, email and password are required"});
    if(!EMAIL_RE.test(email)) return res.status(400).json({message:"Enter a valid email address"});
    if(password.length<6) return res.status(400).json({message:"Password must be at least 6 characters"});

    await connectDB();

    const exists=await User.findOne({email});
    if(exists) return res.status(409).json({message:"Email is already registered"});

    const hash=await bcrypt.hash(password,10);
    let user;
    try {
      user = await User.create({name,email,password:hash});
    } catch (dbErr) {
      // Race condition: two requests passed the findOne check before either
      // finished inserting. The unique index on email still protects data
      // integrity — just surface it as a normal 409 instead of a 500.
      if (dbErr.code === 11000) {
        return res.status(409).json({message:"Email is already registered"});
      }
      throw dbErr;
    }

    return res.status(201).json({message:"Registration successful",user:{id:user._id,name:user.name,email:user.email}});
  } catch(e){return sendError(res,e);}
}