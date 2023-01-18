"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const loggers_1 = require("@/utils/loggers");
const router = express_1.default.Router();
const logger = (0, loggers_1.getLogger)('USER_ROUTE');
/* GET users listing. */
router.get('/', function (_req, res, _next) {
    logger.info('respond with a resource');
    res.send('respond with a resource');
});
exports.default = router;
