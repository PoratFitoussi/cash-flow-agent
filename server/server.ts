import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getTransactionsFromDB, addManualExpense, initDB } from './src/dbService';
import { runBankScraper } from './src/scraperService';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/expenses', async (req, res) => {
    try {
        const transactions = await getTransactionsFromDB();
        
        // Return in the exact format the frontend expects
        res.json({
            success: true,
            data: {
                transactions: transactions
            }
        });
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
        res.status(500).json({ error: "Failed to fetch transactions from Google Sheets" });
    }
});

app.post('/api/sync', async (req, res) => {
    try {
        const { year, month } = req.body;
        if (!year || month === undefined) {
            return res.status(400).json({ error: "Missing year or month in request body" });
        }
        
        // Month is 0-indexed in JS dates
        const startDate = new Date(year, month, 1);
        
        const addedCount = await runBankScraper(startDate);
        
        res.json({ success: true, addedCount });
    } catch (error: any) {
        console.error("Failed to sync transactions:", error);
        res.status(500).json({ error: error.message || "Failed to sync transactions" });
    }
});

app.post('/api/expenses/manual', async (req, res) => {
    try {
        const { date, description, amount } = req.body;
        
        if (!date || !description || amount === undefined) {
            return res.status(400).json({ error: "Missing date, description, or amount in request body" });
        }
        
        const id = await addManualExpense(date, description, Number(amount));
        
        res.json({ success: true, id });
    } catch (error: any) {
        console.error("Failed to add manual expense:", error);
        res.status(500).json({ error: error.message || "Failed to add manual expense" });
    }
});

// Initialize DB and start the server
initDB().then(() => {
    app.listen(port, () => {
        console.log(`API Server running at http://localhost:${port}`);
        console.log(`Endpoint ready at http://localhost:${port}/api/expenses`);
    });
}).catch(err => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
});
