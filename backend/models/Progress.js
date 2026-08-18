import mongoose from "mongoose";
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},lessonId:{type:mongoose.Schema.Types.ObjectId,ref:"Lesson",required:true},completed:{type:Boolean,default:false},quizScore:Number},{timestamps:true});
export default mongoose.models.Progress || mongoose.model("Progress",schema);