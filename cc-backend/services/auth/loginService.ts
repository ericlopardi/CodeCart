import { request } from 'express'
import { supabase } from '../../clients/supabase'
import { logInfo, logError } from '../../utils/logger'

export const initLogin = async (req = request) => {
    logInfo("entered initLogin");

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: req.body.email,
            password: req.body.password
        });

        if (error) throw new Error(`${error.message}`);

        return mapLoginResponse(data);
    } catch (error) {
        logError(`initLogin error: ${error.message}`);
        throw new Error(`initLogin error: ${error.message}`);
    }
}

const mapLoginResponse = (data) => {
    return {
        id: data.user.id,
        email: data.user.email,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in
    };
}
