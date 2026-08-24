import mongoose from "mongoose";

import connectDB from "../../backend/lib/db.js";
import Document from "../../backend/models/Document.js";
import Topic from "../../backend/models/Topic.js";
import Lesson from "../../backend/models/Lesson.js";

import { requireAuth } from "../../backend/lib/auth.js";
import { sendError, setCors } from "../_utils.js";

export default async function handler(req, res) {
  setCors(res, req);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Method not allowed",
      });
    }

    const { userId } = requireAuth(req);

    /*
     * Vercel dynamic route:
     * /api/materials/[id]
     */
    const rawId =
      req.query?.id ||
      req.params?.id ||
      req.url
        ?.split("?")[0]
        ?.split("/")
        .filter(Boolean)
        .pop();

    if (!rawId) {
      return res.status(400).json({
        message: "Material ID is required",
      });
    }

    if (!mongoose.isValidObjectId(rawId)) {
      return res.status(400).json({
        message: "Invalid material ID",
        materialId: rawId,
      });
    }

    await connectDB();

    /*
     * Find material belonging to logged-in user.
     */
    const material = await Document.findOne({
      _id: rawId,
      userId,
    })
      .select("-extractedText")
      .lean();

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
        code: "MATERIAL_NOT_FOUND",
        materialId: String(rawId),
      });
    }

    /*
     * Find topics.
     */
    const topics = await Topic.find({
      documentId: rawId,
    })
      .sort({ order: 1 })
      .lean();

    /*
     * Find lessons.
     */
    const lessons = await Lesson.find({
      documentId: rawId,
    })
      .select("_id topicId title")
      .lean();

    const lessonMap = new Map();

    for (const lesson of lessons) {
      lessonMap.set(
        String(lesson.topicId),
        lesson
      );
    }

    const mergedTopics = topics.map((topic) => ({
      ...topic,
      lessonId:
        lessonMap.get(String(topic._id))?._id ||
        null,
    }));

    return res.status(200).json({
      success: true,
      material,
      topics: mergedTopics,
    });
  } catch (error) {
    console.error(
      "Get material error:",
      error
    );

    return sendError(res, error);
  }
}
