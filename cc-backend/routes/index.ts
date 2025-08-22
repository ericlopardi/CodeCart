// This file is intentionally left empty as a placeholder to ensure the `routes` directory is treated as a module.
// Future route definitions will be added here.

import { Router } from 'express';
import { handleLogin } from '../controllers/auth/loginController';

const router = Router();
router.post('/v1/login', handleLogin);

export default router;