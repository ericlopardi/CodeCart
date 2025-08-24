import { Router } from 'express';
import { handleCreateAddress, handleGetAddresses, handleUpdateAddress, handleDeleteAddress } from '../controllers/addressController';
// import authMiddleware from '../middleware/auth'; // Uncomment when available

const router = Router();

// router.use(authMiddleware); // Uncomment when available

router.post('/api/addresses', handleCreateAddress);
router.get('/api/addresses', handleGetAddresses);
router.patch('/api/addresses', handleUpdateAddress);
router.delete('/api/addresses', handleDeleteAddress);

export default router;