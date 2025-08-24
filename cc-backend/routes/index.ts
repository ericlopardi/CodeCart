// This file is intentionally left empty as a placeholder to ensure the `routes` directory is treated as a module.
// Future route definitions will be added here.

import { Router } from 'express';
import { handleLogin } from '../controllers/auth/loginController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// PUBLIC ROUTES
router.post('/v1/login', handleLogin);

// APPLY AUTH MIDDLEWARE TO PROTECTED ROUTES BELOW
router.use('/v1/protected', authenticateToken);

// PROTECTED ROUTES
router.get('/v1/protected/example', (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

export default router;

