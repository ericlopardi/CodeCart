import { Request, Response, NextFunction } from 'express';
import { supabase } from '../clients/supabase';
import { STATUS_CODE } from '../utils/constants';
import { logInfo, logError } from '../utils/logger';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logInfo('Authenticating token...');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(STATUS_CODE.HTTP_UNAUTHORIZED).json({ error: 'Unauthorized: Access token required' });
        return;
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            res.status(STATUS_CODE.HTTP_UNAUTHORIZED).json({ error: 'Unauthorized: Invalid or expired token' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        logError(`Error authenticating token: ${error.message}`);
        res.status(STATUS_CODE.HTTP_INTERNAL_SERVER_ERROR).json({ error: 'Authentication verification failed' });
    }
}

export const optionalAuthenticateToken = async (req: Request, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) {
      req.user = user;
    }
  } catch (error) {
    // Silently fail for optional auth
    logError(`Optional auth failed: ${error.message}`);
  }
  
  next();
};