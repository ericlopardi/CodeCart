import { request } from 'express'
import { supabase } from '../../clients/supabase'

export const initiateLogin = async (req = request) => {
    // TODO: add logger here
    console.log("entered initiateLogin");

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: req.body.email,
            password: req.body.password
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        throw new Error('Login attempt to supabase failed');
    }
}