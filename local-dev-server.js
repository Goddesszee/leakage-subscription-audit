require('dotenv').config();
const express = require('express');
const cors = require('cors');

const healthHandler = require('./api/health');
const analyzeHandler = require('./api/analyze');
const draftCancellationHandler = require('./api/draft-cancellation');

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Reuse the exact same handlers deployed as Vercel serverless functions
app.all('/api/health', healthHandler);
app.all('/api/analyze', analyzeHandler);
app.all('/api/draft-cancellation', draftCancellationHandler);

app.listen(PORT, () => {
  console.log(`Local dev server (mirroring /api functions) listening on port ${PORT}`);
});
