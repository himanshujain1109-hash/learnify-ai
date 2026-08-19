import mongoose from "mongoose";
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},title:String,originalFileName:String,extractedText:String,status:{type:String,default:"uploaded"}},{timestamps:true});
export default mongoose.models.Document || mongoose.model("Document",schema);