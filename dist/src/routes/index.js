"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const loggers_1 = require("@/utils/loggers");
const router = express_1.default.Router();
const logger = (0, loggers_1.getLogger)('INDEX_ROUTE');
/* GET home page. */
router.get('/', function (_req, res, _next) {
    logger.info('hello Express');
    res.render('index', { title: 'Express' });
});
exports.default = router;
