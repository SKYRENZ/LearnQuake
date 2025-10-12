//para sa env
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { mapSystemPrompt } from "./mapRules.js";
import USGSEarthquakeService from './seismology.js';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); 

// Initialize earthquake service
const earthquakeService = new USGSEarthquakeService();

app.post("/map", async (req, res) => {
  const { place, magnitude, areaCoverage, coordinates } = req.body; //ito yung required na user input

  try {
    // Log what we're about to send
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

    //logs to see kung talagang nasesend sa AI yung request and kung AI talaga yung nageenerate ng data
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

// API Routes
app.get('/api/earthquakes/search', async (req, res) => {
  try {
    const { 
      location, 
      radius = 500, 
      timeframe = 'month',
      limit = 50 
    } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    console.log(`Searching earthquakes near: ${location}`);
    
    const result = await earthquakeService.searchEarthquakesByLocation(
      location,
      parseInt(radius),
      timeframe
    );

    // Limit results
    const limitedEarthquakes = result.earthquakes.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        searchLocation: result.searchLocation,
        earthquakes: limitedEarthquakes,
        totalFound: result.totalFound,
        showing: limitedEarthquakes.length
      }
    });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all recent earthquakes
app.get('/api/earthquakes', async (req, res) => {
  try {
    const { timeframe = 'day', limit = 20 } = req.query;
    
    const earthquakes = await earthquakeService.fetchAllEarthquakes(timeframe);
    const limitedEarthquakes = earthquakes
      .sort((a, b) => b.magnitude - a.magnitude)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: limitedEarthquakes,
      count: limitedEarthquakes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add this route to your backend server
app.get('/api/earthquakes/search-by-country', async (req, res) => {
  try {
    const { country, timeframe = 'month', limit = 50 } = req.query;
    
    if (!country) {
      return res.json({
        success: false,
        error: 'Country parameter is required'
      });
    }

    const earthquakeService = new USGSEarthquakeService();
    const result = await earthquakeService.searchEarthquakesByCountry(country, timeframe);
    
    // Limit results if specified
    if (limit && result.earthquakes.length > limit) {
      result.earthquakes = result.earthquakes.slice(0, parseInt(limit));
      result.showing = parseInt(limit);
    } else {
      result.showing = result.earthquakes.length;
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error searching earthquakes by country:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

// check lang rin if gumagana yung server
app.listen(port, () => {
  console.log(`Map Analysis backend running on http://localhost:${port}`);
  console.log(`Search earthquakes at: http://localhost:${port}/api/earthquakes/search?location=California`);
});
