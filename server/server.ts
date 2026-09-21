import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { apiRouter } from './src/routes/api';
// The auth route is already used inside apiRouter

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRouter);

// Start the server
app.listen(port, () => {
    console.log(`API Server running at http://localhost:${port}`);
});
