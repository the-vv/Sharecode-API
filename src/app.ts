
import express from 'express';
import 'express-async-errors';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors'
import authRouter from './routes/auth/auth';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { appErrorJson } from './utils/helper-functions';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.routerSetup();
  }

  private config() {

    this.app.use(cors({
      origin: ['http://localhost:4200', 'https://sharecodeapp.onrender.com'],
      credentials: true      
    }));
    this.app.use(logger('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  private routerSetup() {
    const apiRouter = express.Router();
    this.app.use('/api', apiRouter)

    apiRouter.use('/auth', authRouter);


    // Error handler
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (res.headersSent) {
        return next(appErrorJson(err?.message ?? ReasonPhrases.INTERNAL_SERVER_ERROR, err));
      }
      return res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR).json(appErrorJson(err?.message ?? ReasonPhrases.INTERNAL_SERVER_ERROR, err));
    });
  }

}

export default new App().app;

