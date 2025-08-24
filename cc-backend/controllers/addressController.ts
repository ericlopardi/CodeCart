import { Request, Response } from 'express';
import {z} from 'zod';
import { addresses } from '../db/schema';


// Controller will handle the input validation then send it over to Services

const AddressSchema = z.object({
    street: z.string().min(5).max(100),
    city: z.string().min(2).max(50),
    state: z.string().length(2).regex(/^[A-Z]{2}$/),
    zipCode: z.string().regex(/^\d{5}(?:[-\s]\d{4})?$/), 
    country: z.string().min(2).max(3).regex(/^[A-Z]{2,3}$/),
    isDefault: z.boolean().optional()                    
});

function validateAddress(req: Request) {
    return AddressSchema.safeParse(req.body);
}

// Create address
export const handleCreateAddress = async (req: Request, res: Response) => {

};

// Get all addresses for current user
export const handleGetAddresses = async (req: Request, res: Response) => {
    // TODO: Get userId from auth, fetch addresses
    res.status(501).json({ message: 'Get addresses not implemented' });
};

// Update address
export const handleUpdateAddress = async (req: Request, res: Response) => {
    // TODO: Validate input, update address, enforce isDefault logic
    res.status(501).json({ message: 'Update address not implemented' });
};

// Delete address
export const handleDeleteAddress = async (req: Request, res: Response) => {
    // TODO: Validate input, delete address
    res.status(501).json({ message: 'Delete address not implemented' });
};