import { Request, Response } from 'express';
import { z } from 'zod';
import { initCreateAddress, initGetAddress, initUpdateAddress, initDeleteAddress} from '../services/addressServices';
import { addresses } from '../db/schema';
import { STATE_REGEX, ZIPCODE_REGEX, COUNTRY_REGEX, STATUS_CODE}  from '../utils/constants';
import { logInfo, logError} from '../utils/logger';

const CreateAddressSchema = z.object({
    streetAddress: z.string().min(5).max(100),
    city: z.string().min(2).max(50),
    state: z.string().length(2).regex(STATE_REGEX),
    zipCode: z.string().regex(ZIPCODE_REGEX),
    country: z.string().min(2).max(3).regex(COUNTRY_REGEX),
    isDefault: z.boolean().optional()
});

const UpdateAddressSchema = z.object({
    streetAddress: z.string().min(5).max(100).optional(),
    city: z.string().min(2).max(50).optional(),
    state: z.string().length(2).regex(STATE_REGEX).optional(),
    zipCode: z.string().regex(ZIPCODE_REGEX).optional(),
    country: z.string().min(2).max(3).regex(COUNTRY_REGEX).optional(),
    isDefault: z.boolean().optional()
});

export const handleCreateAddress = async (req: Request, res: Response) => {
    logInfo("entered handleCreateAddress");
    
    let validation = CreateAddressSchema.safeParse(req.body);
    if (!validation.success) {
        const message = validation.error.issues.map(issue => issue.message).join(', ');
        return res.status(STATUS_CODE.HTTP_BAD_REQUEST).json({
            error: `Validation failed: ${message}`
        });
    }

    try {
        const userId = req.user.id;
        
        // addressServices is called - sends data 
        const newAddress = await initCreateAddress(validation.data, userId);

        if (!newAddress) {
            return res.status(STATUS_CODE.HTTP_INTERNAL_SERVER_ERROR).json({
                error: 'Server error: Failed to create address'
            });
        }
        return res.status(STATUS_CODE.HTTP_CREATED).json({
            message: 'Address created successfully',
            address: newAddress
        });

    } catch (error) {
        logError(`Error creating address: ${error.message}`);
        return res.status(STATUS_CODE.HTTP_INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error'
        });
    }
};

// Get all addresses for current user
export const handleGetAddresses = async (req: Request, res: Response) => {
    logInfo("entered handleGetAddresses");
    
    try {
        const userId = req.user.id;
        
        const addresses = await initGetAddress(userId);
        
        return res.status(STATUS_CODE.HTTP_OK).json({
            message: 'Addresses retrieved successfully',
            addresses: addresses,
            count: addresses.length
        });

    } catch (error) {
        logError(`Error getting addresses: ${error.message}`);
        return res.status(STATUS_CODE.HTTP_INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error'
        });
    }
};

// Update address
export const handleUpdateAddress = async (req: Request, res: Response) => {
    logInfo("entered handleUpdateAddress");
    
    try {
        const addressId = req.params.id;
        if (!addressId) {
            return res.status(STATUS_CODE.HTTP_BAD_REQUEST).json({
                error: 'Address ID is required'
            });
        }

        const validation = UpdateAddressSchema.safeParse(req.body);
        if (!validation.success) {
            const message = validation.error.issues.map(issue => issue.message).join(', ');
            return res.status(STATUS_CODE.HTTP_BAD_REQUEST).json({
                error: `Validation failed: ${message}`
            });
        }

        const userId = req.user.id;

        const updatedAddress = await initUpdateAddress(addressId, validation.data, userId);
        
        if (!updatedAddress) {
            return res.status(STATUS_CODE.HTTP_NOT_FOUND).json({
                error: 'Address not found or access denied'
            });
        }

        return res.status(STATUS_CODE.HTTP_OK).json({
            message: 'Address updated successfully',
            address: updatedAddress
        });

    } catch (error) {
        logError(`Error updating address: ${error.message}`);
        return res.status(STATUS_CODE.HTTP_INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error'
        });
    }
};

// Delete address
export const handleDeleteAddress = async (req: Request, res: Response) => {
    logInfo("entered handleDeleteAddress");
    
    try {
        const addressId = req.params.id;
        if (!addressId) {
            return res.status(STATUS_CODE.HTTP_BAD_REQUEST).json({
                error: 'Address ID is required'
            });
        }

        const userId = req.user.id;

        const deletedAddress = await initDeleteAddress(addressId, userId);
        
        if (!deletedAddress) {
            return res.status(STATUS_CODE.HTTP_NOT_FOUND).json({
                error: 'Address not found or access denied'
            });
        }

        return res.status(STATUS_CODE.HTTP_OK).json({
            message: 'Address deleted successfully',
            deletedAddress: deletedAddress
        });

    } catch (error) {
        logError(`Error deleting address: ${error.message}`);
        return res.status(STATUS_CODE.HTTP_INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error'
        });
    }
};