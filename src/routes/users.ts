import express, { Request, Response } from 'express';
import { getLogger } from '@/utils/loggers';
const router = express.Router();
const logger = getLogger('USER_ROUTE');

/* GET users listing. */
router.get('/', function (req: Request, res: Response) {
  logger.info('respond with a resource');
  res.send('respond with a resource');
});

export default router;
