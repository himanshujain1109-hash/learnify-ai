import mongoose from "mongoose";
const schema=new mongoose.Schema({documentId:{type:mongoose.Schema.Types.ObjectId,ref:"Document",required:true},title:String,description:String,order:Number,difficulty:String},{timestamps:true});
export default mongoose.models.Topic || mongoose.model("Topic",schema);