import express from 'express';
import { getLogger } from '@/utils/loggers';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { UserController } from '../users/controller';
import { appConfigs } from '@/utils/configs';
import { appErrorJson } from '@/utils/helper-functions';
import bcrypt from 'bcrypt';
import { AppStrings } from '@/utils/strings';
import { getNewJwt } from '@/services/jwt-service';
import { TUser, userSchema } from '../users/schema';
const router = express.Router();
const logger = getLogger('USER_ROUTE');
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { TokenCollection } from './schema';
import { sendPasswordResetEmail } from '@/services/email-service';


const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(appConfigs.passwordMinLength)
});

router.post('/google', async (req, res) => {
  const body = userSchema.extend({ idToken: z.string() }).safeParse(req.body);
  if (body.success) {
    const client = new OAuth2Client(appConfigs.googleClientId);
    const ticket = await client.verifyIdToken({
      idToken: body.data.idToken,
      audience: appConfigs.googleClientId
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(StatusCodes.BAD_REQUEST).json(appErrorJson(AppStrings.errorOccurredWhileLogin));
    }
    const user: TUser | null = await UserController.getByEmailAuth(payload['email'] || '');
    if (user) {
      const updatedUser = await UserController.updateOne(user._id || '', {
        email: payload['email'] || '',
        fullName: payload['name'] || '',
        image: payload['picture'] || '',
      })
      const jwt = getNewJwt({ email: user.email, id: user._id || '' });
      const responseUser = { token: jwt, user: updatedUser }
      res.json(responseUser);
    } else {
      const newUser: TUser = {
        email: payload['email'] || '',
        fullName: payload['name'] || '',
        image: payload['picture'] || '',
      };
      const resUser = await UserController.createOne(newUser);
      if (resUser) {
        const jwt = getNewJwt({ email: resUser.email, id: resUser._id || '' });
        const responseUser = { token: jwt, user: resUser }
        res.json(responseUser);
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(appErrorJson(AppStrings.errorPerformingDbOperation));
      }
    }
  } else {
    res.status(StatusCodes.BAD_REQUEST).json(appErrorJson(AppStrings.validationErrorsOccurred, body.error))
  }
});

router.post('/login', (req, res) => {
  const body = loginSchema.safeParse(req.body);
  if (body.success) {
    UserController.getByEmailAuth(body.data.email, true).then(async (user) => {
      if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(AppStrings.invalidEmailPassword));
      }
      if (!user.password) {
        return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(AppStrings.accountCreatedWithSocialLogin));
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
    res.status(StatusCodes.BAD_REQUEST).json(appErrorJson(AppStrings.validationErrorsOccurred, body.error))
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
      const resUser = await UserController.createOne(newUser);
      if (resUser) {
        res.json({ success: true })
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(appErrorJson(AppStrings.errorPerformingDbOperation));
      }
    });
  } else {
    res.status(StatusCodes.BAD_REQUEST).json(appErrorJson(AppStrings.validationErrorsOccurred, body.error))
  }
})

router.post('/forgot-password', async (req, res) => {
  const body = z.object({ email: z.string().email() }).safeParse(req.body);
  if (body.success) {
    const user: TUser | null = await UserController.getByEmailAuth(body.data.email || '');
    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json(appErrorJson(AppStrings.emailEnteredIsNotRegistered));
    }
    const token = crypto.randomBytes(20).toString('hex');
    const tokenItem = await new TokenCollection({
      token: token,
      userId: user._id,
    }).save();
    if (tokenItem) {
      await sendPasswordResetEmail(user.email || '', token, user._id || '');
      res.json({ success: true });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(appErrorJson(AppStrings.errorPerformingDbOperation));
    }
  } else {
    res.status(StatusCodes.BAD_REQUEST).json(appErrorJson(AppStrings.validationErrorsOccurred, body.error))
  }
})


export default router;
