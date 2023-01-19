
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors'
import indexRouter from './routes/index';
import usersRouter from './routes/users';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.routerSetup();
  }

  private config() {

    this.app.use(cors())
    this.app.use(logger('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  private routerSetup() {
    const apiRouter = express.Router();
    this.app.use('/api', apiRouter)

    apiRouter.use('/', indexRouter);
    apiRouter.use('/users', usersRouter);
  }

}

export default new App().app;

