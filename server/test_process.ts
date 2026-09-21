import { db } from './src/db';
import { processPendingTransactions } from './src/services/aiCategorization.service';

processPendingTransactions().then(console.log).catch(console.error);
