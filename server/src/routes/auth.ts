import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    id: string;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // DEVELOPMENT BYPASS: Auto-login as test user so we don't need a frontend login page for now
  let userRecords = await db.select().from(users).limit(1);
  if (userRecords.length === 0) {
    userRecords = await db.insert(users).values({ email: 'test@agentfinance.local' }).returning();
  }
  req.user = { email: userRecords[0].email, id: userRecords[0].id };
  return next();

  /*
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const whitelist = (process.env.AUTH_EMAIL_WHITELIST || '').split(',').map(e => e.trim().toLowerCase());

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
    }

    const email = payload.email.toLowerCase();

    // Whitelist check
    if (!whitelist.includes(email)) {
      return res.status(403).json({ error: 'Forbidden: Email not whitelisted' });
    }

    // Get or Create user in db
    let userRecords = await db.select().from(users).where(eq(users.email, email));
    let userRecord = userRecords[0];

    if (!userRecord) {
      const inserted = await db.insert(users).values({ email }).returning();
      userRecord = inserted[0];
    }

    req.user = { email: userRecord.email, id: userRecord.id };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
  */
}
