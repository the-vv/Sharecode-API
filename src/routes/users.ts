import express from 'express';
import { getLogger } from '@/utils/loggers';
const router = express.Router();
const logger = getLogger('USER_ROUTE');

/* GET users listing. */
router.get('/', function (req, res) {
  logger.info('respond with a resource');
  res.send('respond with a resource');
});

export default router;
