import { supabase } from '../clients/supabase';
import { addresses } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logInfo, logError } from '../utils/logger';

export const initCreateAddress = async (addressData, userId) => {
    logInfo("entered initCreateAddress");
    
    try {
        if (addressData.isDefault) {
            const { error: updateError } = await supabase
                .from('addresses')``
                .update({ isDefault: false })
                .eq('userId', userId);
            
            if (updateError) {
                throw new Error(`Failed to update existing default addresses: ${updateError.message}`);
            }
        }

        const { data: newAddress, error } = await supabase
            .from('addresses')
            .insert({
                userId: userId,
                streetAddress: addressData.streetAddress,
                city: addressData.city,
                state: addressData.state,
                zipCode: addressData.zipCode,
                country: addressData.country,
                isDefault: addressData.isDefault || false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create address: ${error.message}`);
        }

        logInfo(`Address created successfully for user ${userId}`);
        return newAddress;

    } catch (error) {
        logError(`Error in initCreateAddress: ${error.message}`);
        throw new Error('Failed to create address');
    }
};

export const initGetAddress = async (userId) => {
    logInfo("entered initGetAddress");
    
    try {
        const { data: addresses, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('userId', userId)
            .order('createdAt', { ascending: false });
        
        if (error) {
            throw new Error(`Failed to fetch addresses: ${error.message}`);
        }

        logInfo(`Retrieved ${addresses?.length || 0} addresses for user ${userId}`);
        return addresses || [];

    } catch (error) {
        logError(`Error in getAddressesService: ${error.message}`);
        throw new Error('Failed to retrieve addresses');
    }
};

export const initUpdateAddress = async (addressId, updateData, userId) => {
    logInfo("entered initUpdateAddress");
    
    try {
        if (updateData.isDefault) {
            const { error: updateError } = await supabase
                .from('addresses')
                .update({ isDefault: false })
                .eq('userId', userId)
                .neq('id', addressId);
            
            if (updateError) {
                throw new Error(`Failed to update other default addresses: ${updateError.message}`);
            }
        }

        const { data: updatedAddress, error } = await supabase
            .from('addresses')
            .update({
                ...updateData,
                updatedAt: new Date().toISOString()
            })
            .eq('id', addressId)
            .eq('userId', userId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update address: ${error.message}`);
        }

        logInfo(`Address ${addressId} updated successfully for user ${userId}`);
        return updatedAddress;

    } catch (error) {
        logError(`Error in updateAddressService: ${error.message}`);
        throw new Error('Failed to update address');
    }
};

export const initDeleteAddress = async (addressId, userId) => {
    logInfo("entered initDeleteAddress");
    
    try {
        const { data: deletedAddress, error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', addressId)
            .eq('userId', userId) 
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to delete address: ${error.message}`);
        }

        logInfo(`Address ${addressId} deleted successfully for user ${userId}`);
        return deletedAddress;

    } catch (error) {
        logError(`Error in deleteAddressService: ${error.message}`);
        throw new Error('Failed to delete address');
    }
};

