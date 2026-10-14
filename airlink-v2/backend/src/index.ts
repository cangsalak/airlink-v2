import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router } from './routes/api.js';
import { checkDbConnection } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', router);

// Root test
app.get('/', (req, res) => {
  res.send({ name: 'Airlink V2 Backend API', version: '2.0.0', status: 'running' });
});

app.listen(PORT, async () => {
  console.log(`[Airlink Backend] Server is running on http://localhost:${PORT}`);
  const dbConnected = await checkDbConnection();
  if (dbConnected) {
    console.log('[Airlink Backend] Database connected successfully.');
  } else {
    console.warn('[Airlink Backend] Database connection failed or waiting for container to start.');
  }
});
