import express from 'express';
import { getLogger } from '@/utils/loggers';
import { z } from 'zod';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
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
import { TokenCollection } from './token.schema';
import { sendPasswordResetEmail } from '@/services/email-service';
import { loginMW } from '@/middlewares/loginMW';


router.post('/google', async (req, res) => {
  const body = userSchema.extend({ idToken: z.string() }).parse(req.body);
  const client = new OAuth2Client(appConfigs.googleClientId);
  const ticket = await client.verifyIdToken({
    idToken: body.idToken,
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
});

router.post('/login', (req, res) => {
  const body = z.object({
    email: z.string().email(),
    password: z.string().min(appConfigs.passwordMinLength)
  }).parse(req.body);
  UserController.getByEmailAuth(body.email, true).then(async (user) => {
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(AppStrings.invalidEmailPassword));
    }
    if (!user.password) {
      return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(AppStrings.accountCreatedWithSocialLogin));
    }
    const pwdPassed = await bcrypt.compare(body.password, user.password || '');
    if (!pwdPassed) {
      return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(AppStrings.invalidEmailPassword));
    }
    const jwt = getNewJwt({ email: user.email, id: user._id || '' });
    const responseUser = { token: jwt, user: { ...user, password: undefined } }
    res.json(responseUser);
  }).catch(err => {
    return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(AppStrings.invalidEmailPassword, err));
  });
});

router.post('/signup', (req, res) => {
  const body = userSchema.required().parse(req.body);
  UserController.getByEmailAuth(body.email).then(async (user) => {
    if (user) {
      return res.status(StatusCodes.BAD_REQUEST).json(appErrorJson(AppStrings.userExists));
    }
    const newUser = {
      ...body,
      password: await bcrypt.hash(body.password, appConfigs.passwordHashSaltLength)
    };
    const resUser = await UserController.createOne(newUser);
    if (resUser) {
      res.json({ success: true })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(appErrorJson(AppStrings.errorPerformingDbOperation));
    }
  });
})

router.post('/forgot-password', async (req, res) => {
  const body = z.object({ email: z.string().email() }).parse(req.body);
  const user: TUser | null = await UserController.getByEmailAuth(body.email || '');
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
})

router.post('/reset-password', async (req, res) => {
  const body = z.object({
    token: z.string(),
    password: z.string().min(appConfigs.passwordMinLength),
    userId: z.string()
  }).parse(req.body);
  const tokenValid = await TokenCollection.find({ token: body.token, userId: body.userId }).countDocuments();
  if (!tokenValid) {
    return res.status(StatusCodes.BAD_REQUEST).json(appErrorJson(AppStrings.resetPasswordLinkExpired));
  }
  const password = await bcrypt.hash(body.password, appConfigs.passwordHashSaltLength)
  const newUser = await UserController.updatePasswordByUserId(body.userId, password);
  await TokenCollection.findOneAndDelete({ token: body.token, userId: body.userId });
  if (newUser) {
    res.json({ success: true });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(appErrorJson(AppStrings.errorPerformingDbOperation));
  }
});

router.get('/profile', loginMW, async (req, res) => {
  if (res.locals?.currentUser) { // this should be set from login middleware
    const userId = res.locals.currentUser.id;
    const currentUser = await UserController.getById(userId);
    if (!currentUser) {
      return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(ReasonPhrases.UNAUTHORIZED));
    }
    const jwt = getNewJwt({ email: currentUser.email, id: currentUser._id || '' });
    res.json({user: currentUser, token: jwt})
  } else {
    return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(ReasonPhrases.UNAUTHORIZED));
  }
});

export default router;
