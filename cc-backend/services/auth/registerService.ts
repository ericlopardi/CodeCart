import { Request } from 'express';
import { mapLoginResponse } from './loginService';
import { db } from '../../db/index';
import { customers, users } from '../../db/schema';
import { supabase } from '../../clients/supabase';
import { logInfo, logError } from '../../utils/logger';

export const initRegister = async (req: Request) => {
    try {
        // use a transaction to ensure atomicity
        const result = await db.transaction(async (tx) => {
            // step 1: create customer record
            const customerId = await createCustomerRecordTx(req, tx);
            
            // step 2: Register with Supabase (outside transaction/external API call)
            const supabaseData = await registerWithSupabase(req);
            if (!supabaseData.user) throw new Error('Supabase user creation failed');

            // step 3: create user record
            await createUserRecordTx(req, supabaseData.user.id, customerId, tx);
            
            return supabaseData;
        });
        
        logInfo('Registration completed successfully');
        return mapLoginResponse(result);
    } catch (error) {
        logError(`initRegister error: ${error.message}`);
        throw new Error('Registration failed');
    }
}

const createCustomerRecordTx = async (req: Request, tx) => {
    const [customer] = await tx.insert(customers).values({
        firstName: req.body.firstName.toUpperCase(),
        lastName: req.body.lastName.toUpperCase(),
        phoneNumber: req.body.phoneNumber ? formatPhoneNumber(req.body.phoneNumber) : null,
        email: req.body.email
    }).returning({ id: customers.id });
    return customer.id;
}

const registerWithSupabase = async (req: Request) => {
    const { data, error } = await supabase.auth.signUp({
        email: req.body.email,
        password: req.body.password,
        options: {
            data: {
                first_name: req.body.firstName,
                last_name: req.body.lastName,
                phone_number: req.body.phoneNumber ? formatPhoneNumber(req.body.phoneNumber) : null,
                birth_date: req.body.birthDate
            }
        }
    })
    if (error) throw new Error(`${error.message}`);
    return data;
}

const createUserRecordTx = async (req: Request, supabaseAuthId: string, customerId: number, tx) => {
    await tx.insert(users).values({
        sbAuthId: supabaseAuthId,
        email: req.body.email,
        isActive: true,
        birthDate: req.body.birthDate,
        customerId: customerId,
    });
}

const formatPhoneNumber = (phoneNumber: string) => {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // E.164 format: +[country code][subscriber number]
    // If number doesn't start with country code, assume US (+1)
    if (cleaned.length === 10) {
        return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+${cleaned}`;
    } else if (cleaned.startsWith('1') && cleaned.length > 11) {
        // Remove extra digits if they exist
        return `+${cleaned.substring(0, 11)}`;
    } else {
        // For other country codes or malformed numbers, add + prefix
        return `+${cleaned}`;
    }
}
