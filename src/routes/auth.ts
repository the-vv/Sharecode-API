import express from 'express';
import { getLogger } from '@/utils/loggers';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { UserController } from './users/controller';
import { appConfigs } from '@/utils/configs';
import { appErrorJson } from '@/utils/helper-functions';
import bcrypt from 'bcrypt';
import { AppStrings } from '@/utils/strings';
import { getNewJwt } from '@/services/jwt-service';
import { userSchema } from './users/schema';
const router = express.Router();
const logger = getLogger('USER_ROUTE');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(appConfigs.passwordMinLength)
});


router.post('/login', (req, res) => {
  const body = loginSchema.safeParse(req.body);
  if (body.success) {
    UserController.getByEmailAuth(body.data.email, true).then(async (user) => {
      if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(AppStrings.invalidEmailPassword));
      }
      const pwdPassed = await bcrypt.compare(body.data.password, user.password || '');
      if (!pwdPassed) {
        return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(AppStrings.invalidEmailPassword));
      }
      const jwt = getNewJwt({ email: user.email, id: user._id || '' });
      const responseUser = { token: jwt, user: { ...user, password: undefined } }
      res.json(responseUser);
    }).catch(err => {
      return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(AppStrings.invalidEmailPassword, err));
    });
  } else {
    res.status(StatusCodes.BAD_REQUEST).json(appErrorJson(AppStrings.errorPerformingDbOperation, body.error))
  }
});

router.post('/signup', (req, res) => {
  const body = userSchema.required().safeParse(req.body);
  if (body.success) {
    UserController.getByEmailAuth(body.data.email).then(async (user) => {
      if (user) {
        return res.status(StatusCodes.BAD_REQUEST).json(appErrorJson(AppStrings.userExists));
      }
      const newUser = {
        ...body.data,
        password: await bcrypt.hash(body.data.password, appConfigs.passwordHashSaltLength)
      };
      const resUser = await UserController.createOne(newUser).catch(err => {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(appErrorJson(AppStrings.errorPerformingDbOperation, err));
      });
      if (resUser) {
        res.json({ success: true })
      }
    });
  } else {
    res.status(StatusCodes.BAD_REQUEST).json(appErrorJson(AppStrings.validationErrorsOccurred, body.error))
  }
})

export default router;
