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
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email
    }).returning({ id: customers.id });
    return customer.id;
}

const registerWithSupabase = async (req: Request) => {
    const { data, error } = await supabase.auth.signUp({
        email: req.body.email,
        password: req.body.password
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
