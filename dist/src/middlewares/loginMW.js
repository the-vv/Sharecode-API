"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginMW = void 0;
const jwt_service_1 = require("@/services/jwt-service");
const helper_functions_1 = require("@/utils/helper-functions");
const http_status_codes_1 = require("http-status-codes");
const status_codes_1 = require("http-status-codes/build/cjs/status-codes");
const loginMW = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get auth token from header bearer token
        const token = req.headers.authorization;
        // Get json-web-token
        const jwt = (_a = token === null || token === void 0 ? void 0 : token.split(' ')) === null || _a === void 0 ? void 0 : _a[1];
        if (!jwt) {
            return res.status(status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_functions_1.appErrorJson)(http_status_codes_1.ReasonPhrases.UNAUTHORIZED));
        }
        const clientData = yield (0, jwt_service_1.verifyJwt)(jwt);
        res.locals.currentUser = clientData;
        next();
    }
    catch (err) {
        return res.status(status_codes_1.StatusCodes.UNAUTHORIZED).json((0, helper_functions_1.appErrorJson)(String((err === null || err === void 0 ? void 0 : err.message) || err)));
    }
});
exports.loginMW = loginMW;
