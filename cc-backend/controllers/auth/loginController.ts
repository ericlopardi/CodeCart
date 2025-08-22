import { request, response } from 'express';
import { z } from 'zod';
import { PASSWORD_REGEX, STATUS_CODE } from '../../utils/constants';
import { initiateLogin } from '../../services/auth/loginService';

const userSchema = z.object({
    email: z.email(),
    password: z.string().min(8).regex(PASSWORD_REGEX)
  });

export const handleLogin = async (req = request, res = response) => {
    // TODO: add logger here
    console.log("entered loginController")
    let validation = userSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(STATUS_CODE.HTTP_BAD_REQUEST).json({
          error: validation.error.message
      });
    }
    try {
      const loginResult = await initiateLogin(req);
      return res.status(STATUS_CODE.HTTP_OK).json({
          data: loginResult
      });
    } catch (error) {
        return res.status(STATUS_CODE.HTTP_INTERNAL_SERVER_ERROR).json({
            error: error.message
        });
    }
  
}