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
    const { userId } = requireAuth(req);

    await connectDB();

    /*
     * GET /api/materials
     */
    if (req.method === "GET") {
      const materials = await Document.find({
        userId,
      })
        .select("-extractedText")
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        materials,
      });
    }

    /*
     * POST /api/materials
     */
    if (req.method === "POST") {
      const { documentId } = req.body || {};

      if (!documentId) {
        return res.status(400).json({
          message: "Document ID is required",
        });
      }

      const material = await Document.findOne({
        _id: documentId,
        userId,
      })
        .select("-extractedText")
        .lean();

      if (!material) {
        return res.status(404).json({
          message: "Material not found",
        });
      }

      const topics = await Topic.find({
        documentId,
      })
        .sort({ order: 1 })
        .lean();

      const lessons = await Lesson.find({
        documentId,
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

      const mergedTopics = topics.map(
        (topic) => ({
          ...topic,
          lessonId:
            lessonMap.get(
              String(topic._id)
            )?._id || null,
        })
      );

      return res.status(200).json({
        success: true,
        material,
        topics: mergedTopics,
      });
    }

    return res.status(405).json({
      message: "Method not allowed",
    });
  } catch (error) {
    return sendError(res, error);
  }
}
