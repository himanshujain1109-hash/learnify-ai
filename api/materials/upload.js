import multer from "multer";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

import Document from "../../backend/models/Document.js";
import Topic from "../../backend/models/Topic.js";

import connectDB from "../../backend/lib/db.js";
import { requireAuth } from "../../backend/lib/auth.js";
import { generateJSON } from "../../backend/lib/gemini.js";
import { sendError, setCors } from "../_utils.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize:
      (Number(process.env.MAX_UPLOAD_MB) || 10) *
      1024 *
      1024,
  },
});

function runMulter(req, res) {
  return new Promise((resolve, reject) => {
    upload.single("file")(req, res, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function extractText(file) {
  const fileName = file.originalname.toLowerCase();

  if (fileName.endsWith(".pdf")) {
    const result = await pdfParse(file.buffer);
    return result.text;
  }

  if (fileName.endsWith(".docx")) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    return result.value;
  }

  if (fileName.endsWith(".txt")) {
    return file.buffer.toString("utf8");
  }

  throw Object.assign(
    new Error(
      "Only PDF, DOCX and TXT files are supported."
    ),
    {
      statusCode: 400,
    }
  );
}

export default async function handler(req, res) {
  setCors(res, req);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Method not allowed",
      });
    }

    /*
     * Authenticate user first.
     */
    const { userId } = requireAuth(req);

    /*
     * Parse multipart/form-data.
     */
    await runMulter(req, res);

    if (!req.file) {
      return res.status(400).json({
        message: "Please select a file.",
      });
    }

    /*
     * Extract text from uploaded file.
     */
    const extractedText = (
      await extractText(req.file)
    )
      .replace(/\s+/g, " ")
      .trim();

    if (!extractedText) {
      return res.status(400).json({
        message:
          "Could not extract any readable text from this file.",
      });
    }

    /*
     * Connect to MongoDB.
     */
    await connectDB();

    const title =
      req.body?.title?.trim() ||
      req.file.originalname.replace(/\.[^.]+$/, "");

    /*
     * Create material.
     */
    const material = await Document.create({
      userId,
      title,
      originalFileName: req.file.originalname,
      extractedText,
      status: "processing",
    });

    /*
     * Generate topics with Gemini.
     */
    try {
      const prompt = `
You are an expert college professor.

Analyze the following academic material.

Identify between 3 and 12 major teachable topics.

Return ONLY valid JSON in this exact structure:

{
  "topics": [
    {
      "title": "Topic title",
      "description": "Short description",
      "order": 1,
      "difficulty": "Beginner"
    }
  ]
}

Difficulty must be one of:
Beginner
College
Advanced

Do not invent topics that are not supported by the material.

Academic material:

${extractedText.slice(0, 50000)}
`;

      const result = await generateJSON(prompt);

      const topicData = Array.isArray(result?.topics)
        ? result.topics
        : [];

      if (topicData.length > 0) {
        await Topic.insertMany(
          topicData.map((topic, index) => ({
            title: topic.title || `Topic ${index + 1}`,
            description:
              topic.description || "",
            order:
              Number(topic.order) || index + 1,
            difficulty:
              topic.difficulty || "College",
            documentId: material._id,
          }))
        );
      }
    } catch (aiError) {
      console.error(
        "AI topic generation failed:",
        aiError
      );

      /*
       * Keep the material even if Gemini fails.
       */
      material.status = "uploaded";
      await material.save();

      return res.status(201).json({
        success: true,
        warning:
          "Material uploaded successfully, but AI topic generation failed.",
        material: {
          _id: String(material._id),
          title: material.title,
          originalFileName:
            material.originalFileName,
          status: material.status,
        },
        topics: [],
      });
    }

    /*
     * Mark material as completed.
     */
    material.status = "completed";
    await material.save();

    /*
     * Get generated topics.
     */
    const topics = await Topic.find({
      documentId: material._id,
    })
      .sort({ order: 1 })
      .lean();

    /*
     * IMPORTANT:
     * Return MongoDB material ID to frontend.
     */
    return res.status(201).json({
      success: true,

      material: {
        _id: String(material._id),
        title: material.title,
        originalFileName:
          material.originalFileName,
        status: material.status,
      },

      topics,
    });
  } catch (error) {
    console.error(
      "Material upload error:",
      error
    );

    return sendError(res, error);
  }
}
