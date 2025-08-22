import { request, Response, response } from 'express';
import { z } from 'zod';
import { PASSWORD_REGEX, STATUS_CODE } from '../../utils/constants';
import { initLogin } from '../../services/auth/loginService';
import { logInfo, logError } from '../../utils/logger';

const userSchema = z.object({
    email: z.email(),
    password: z.string().min(8).regex(PASSWORD_REGEX)
  });

export const handleLogin = async (req = request, res = response): Promise<Response> => {
    logInfo("entered handleLogin");
    let validation = userSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(STATUS_CODE.HTTP_BAD_REQUEST).json({
          error: validation.error.message
      });
    }
    try {
      const loginResult = await initLogin(req);
      return res.status(STATUS_CODE.HTTP_OK).json({
        id: loginResult.id,
        email: loginResult.email,
        accessToken: loginResult.accessToken,
        refreshToken: loginResult.refreshToken,
        expiresIn: loginResult.expiresIn
      });
    } catch (error) {
        return res.status(STATUS_CODE.HTTP_INTERNAL_SERVER_ERROR).json({
            error: error.message
        });
    }
  
}