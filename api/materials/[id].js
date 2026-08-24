import mongoose from "mongoose";
import connectDB from "../../backend/lib/db.js";
import Document from "../../backend/models/Document.js";
import Topic from "../../backend/models/Topic.js";
import Lesson from "../../backend/models/Lesson.js";
import { requireAuth } from "../../backend/lib/auth.js";
import { sendError, setCors } from "../_utils.js";

export default async function handler(req, res) {
  setCors(res, req);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { userId } = requireAuth(req);

    // Vercel supplies req.query.id for /api/materials/[id].
    // The pathname fallback also makes this work reliably when the same
    // handler is invoked through Express/Render.
    const rawId =
      req.query?.id ||
      req.params?.id ||
      req.url?.split("?")[0]?.split("/").filter(Boolean).pop();

    if (!rawId || !mongoose.isValidObjectId(rawId)) {
      return res.status(400).json({ message: "Invalid material id" });
    }

    await connectDB();

    const material = await Document.findOne({
      _id: rawId,
      userId
    }).select("-extractedText").lean();

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
        code: "MATERIAL_NOT_FOUND",
        materialId: String(rawId)
      });
    }

    const topics = await Topic.find({ documentId: rawId })
      .sort({ order: 1 })
      .lean();

    const lessons = await Lesson.find({ documentId: rawId })
      .select("_id topicId title")
      .lean();

    const lessonMap = new Map(
      lessons.map((lesson) => [String(lesson.topicId), lesson])
    );

    const merged = topics.map((topic) => ({
      ...topic,
      lessonId: lessonMap.get(String(topic._id))?._id || null
    }));

    return res.json({ material, topics: merged });
  } catch (e) {
    return sendError(res, e);
  }
}
