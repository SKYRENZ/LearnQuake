//para sa env
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import earthquakeRoutes from './routes/earthquakeRoutes.js';
import mapRoutes from './routes/mapRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); 

// Routes
app.use('/api/earthquakes', earthquakeRoutes);
app.use('/map', mapRoutes);

// check lang rin if gumagana yung server
app.listen(port, () => {
  console.log(`Map Analysis backend running on http://localhost:${port}`);
  console.log(
    `Search earthquakes at: http://localhost:${port}/api/earthquakes/search?location=California`,
  );
});
