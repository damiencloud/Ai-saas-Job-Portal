// @ts-check
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'career-ops-api', timestamp: new Date().toISOString() });
});

// Jobs API Gateway
app.get('/api/jobs', async (req, res) => {
  res.json({
    ok: true,
    jobs: [
      {
        id: 'job_1',
        title: 'Senior Full Stack Developer',
        company: 'Vercel',
        applyUrl: 'https://job-boards.greenhouse.io/vercel/jobs/6122437004',
        matchScore: 4.9,
        location: 'Remote / India',
      },
    ],
  });
});

// Start Express API server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Career-Ops REST API running on http://localhost:${PORT}`);
  });
}

export default app;
