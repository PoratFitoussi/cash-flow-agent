require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bank scraper server is running' });
});

// Placeholder for bank extraction endpoint
app.post('/api/sync', async (req, res) => {
  try {
    // In the future, this will trigger the puppeteer scraper or API integration
    res.json({ status: 'success', data: { transactions: [], balance: 0 } });
  } catch (error) {
    console.error('Error syncing data:', error);
    res.status(500).json({ error: 'Failed to sync with bank' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
