import express from 'express';
import { getLogger } from '@/utils/loggers';
import { z } from 'zod';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { UserController } from './users/controller';
import { appConfigs } from '@/utils/configs';
import { appErrorJson } from '@/utils/helper-functions';
import bcrypt from 'bcrypt';
import { AppStrings } from '@/utils/strings';
import { getNewJwt } from '@/services/jwt-service';
const router = express.Router();
const logger = getLogger('USER_ROUTE');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(appConfigs.passwordMinLength)
});


router.post('/login', (req, res) => {
  const body = loginSchema.safeParse(req.body);
  if (body.success) {
    UserController.getByEmail(body.data.email).then(async (user) => {
      if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(AppStrings.invalidEmailPassword))
      }
      const pwdPassed = await bcrypt.compare(body.data.password, user.password || '');
      if (!pwdPassed) {
        return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(AppStrings.invalidEmailPassword));
      }
      const jwt = getNewJwt({ email: user.email, id: user._id || '' });
      const responseUser = Object.assign({ token: jwt }, { user }, { password: undefined })
      res.json(responseUser);
    }).catch(err => {
      return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(AppStrings.invalidEmailPassword, err));
    });
  } else {
    res.status(StatusCodes.BAD_REQUEST).json(appErrorJson(AppStrings.validationErrorsOccurred, body.error))
  }
});

export default router;
