// server.js (Node.js with Express)
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); // Load environment variables from .env

const app = express();
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() }); // Store image in memory as buffer

app.use(cors()); // Enable CORS for your React app

// Access your API key as an environment variable (best practice)
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY not found in .env file. Please set it.");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);

// Helper function to convert Buffer to Gemini's Part format
function fileToGenerativePart(fileBuffer, mimeType) {
  return {
    inlineData: {
      data: fileBuffer.toString("base64"),
      mimeType: mimeType,
    },
  };
}

router.post(
  "/infer-gender-gemini",
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use the vision-capable model

      const imagePart = fileToGenerativePart(
        req.file.buffer,
        req.file.mimetype
      );

      const prompt = `
You are analyzing an image to determine the apparent gender of a person based solely on visual cues.

**Important conditions**:
- There must be **exactly one person** in the image.
- The person's **face must be clearly visible and unobstructed**.

If these conditions are not met, reply only with:
- "The person appears to be uncertain."

Otherwise, respond strictly in one of the following formats:
- "The person appears to be male."
- "The person appears to be female."

**Additional instruction**:
This gender classification will be used to recommend clothing. If the person appears to be male, female clothing must not be recommended, and vice versa. If gender is uncertain, no clothing should be suggested.

Do not provide any other commentary or details.
`;

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text().trim();

      console.log("Gemini raw response:", text);

      // --- Process Gemini's text response to infer gender ---
      let inferredGender = "Uncertain"; // Default
      if (text.toLowerCase().includes("appears to be male")) {
        inferredGender = "Male";
      } else if (text.toLowerCase().includes("appears to be female")) {
        inferredGender = "Female";
      }

      res.json({ inferredGender, rawGeminiResponse: text });
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({
        error: "Failed to infer gender using AI.",
        details: error.message,
      });
    }
  }
);

const PORT = process.env.PORT || 5000;

app.use("/api", router);
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
