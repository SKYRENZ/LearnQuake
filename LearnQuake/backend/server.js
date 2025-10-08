//para sa env
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { mapSystemPrompt } from "./mapRules.js";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json()); 

const PORT = 5000;

app.post("/map", async (req, res) => {
  const { place, magnitude, areaCoverage, coordinates } = req.body; //ito yung required na user input

  try {
    // Log what we’re about to send
    console.log("📤 Sending request to OpenAI with body:", {
      place,
      magnitude,
      areaCoverage,
      coordinates
    });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: mapSystemPrompt,
          },
          {
            role: "user",
            content: JSON.stringify({
              place: place,
              coordinates: coordinates,
              magnitude: magnitude,
              areaCoverage: areaCoverage,
            }),
          },
        ],
      }),
    });

    //logs to see kung talagang nasesend sa AI yung request and kung AI talaga yung naggeenerate ng data
    console.log("📥 Response status from OpenAI:", response.status);

    const data = await response.json();
    console.log("📥 Raw response from OpenAI:", JSON.stringify(data, null, 2));

    let analysisText = data.choices?.[0]?.message?.content;

    if (!analysisText) {
      return res.status(500).json({ error: "No content received from OpenAI." });
    }

    // check lang if valid json
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (err) {
      console.error("⚠️ AI did not return JSON:", analysisText);
      return res.status(500).json({ error: "Invalid AI response" });
    }

    res.json({ analysis });
  } catch (error) {
    console.error("❌ Error in /map:", error);
    res.status(500).json({ error: "Something went wrong with Map Analysis." });
  }
});

// check lang rin if gumagana yung server
app.listen(PORT, () => {
  console.log(`Map Analysis backend running on http://localhost:${PORT}`);
});
