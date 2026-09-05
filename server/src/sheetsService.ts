import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

export async function saveTransactionsToSheet(accounts: any[]) {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    // Replace literal '\n' strings with actual newlines for the private key
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!sheetId || !email || !key) {
        throw new Error("Missing Google Sheets credentials in .env (GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY)");
    }

    // Initialize auth - using the modern v4 google-spreadsheet JWT approach
    const jwt = new JWT({
        email: email,
        key: key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, jwt);
    await doc.loadInfo();

    // Use the first worksheet
    const sheet = doc.sheetsByIndex[0];
    
    // Ensure headers exist
    try {
        await sheet.loadHeaderRow();
    } catch (e) {
        // If the sheet is completely empty, set headers
        await sheet.setHeaderRow(['Id', 'Date', 'Description', 'Amount', 'Status', 'Account']);
    }

    // Fetch existing rows to build deduplication set
    const rows = await sheet.getRows();
    const existingSet = new Set(rows.map(row => row.get('Id'))); 

    let addedCount = 0;
    
    for (const account of accounts) {
        // israeli-bank-scrapers puts transactions in `txns` array
        const transactions = account.txns || [];
        for (const tx of transactions) {
            // Generate a unique identifier for the transaction to prevent duplicates
            const uniqueId = `${tx.date}_${tx.description}_${tx.chargedAmount}`;
            
            if (!existingSet.has(uniqueId)) {
                await sheet.addRow({
                    Id: uniqueId,
                    Date: tx.date,
                    Description: tx.description,
                    Amount: tx.chargedAmount,
                    Status: tx.status,
                    Account: account.accountNumber
                });
                addedCount++;
            }
        }
    }

    return addedCount;
}