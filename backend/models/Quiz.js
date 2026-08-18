import mongoose from "mongoose";
const schema=new mongoose.Schema({lessonId:{type:mongoose.Schema.Types.ObjectId,ref:"Lesson",required:true},questions:Array},{timestamps:true});
export default mongoose.models.Quiz || mongoose.model("Quiz",schema);