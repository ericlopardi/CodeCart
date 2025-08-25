import { Router } from 'express';
import { handleLogin } from '../controllers/auth/loginController';
import { authenticateToken } from '../middleware/authMiddleware';
import { handleCreateAddress, handleGetAddresses, handleUpdateAddress, handleDeleteAddress } from '../controllers/addressController';

const router = Router();

// PUBLIC ROUTES
router.post('/v1/login', handleLogin);

// APPLY AUTH MIDDLEWARE TO PROTECTED ROUTES BELOW
router.use('/v1/protected', authenticateToken);

// PROTECTED ROUTES
router.post('/v1/addresses', handleCreateAddress);
// router.get('/v1/addresses:', handleGetAddresses);
// router.patch('/v1/addresses/:id', handleUpdateAddress);
// router.delete('/v1/addresses/:id', handleDeleteAddress);

router.get('/v1/protected/example', (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});



export default router;

