"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = exports.getNewJwt = void 0;
const constants_1 = require("@/utils/constants");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getNewJwt = (payload) => {
    return jsonwebtoken_1.default.sign(payload, String(process.env.TOKEN_SECRET), { expiresIn: constants_1.appConstants.jwtExpirey });
};
exports.getNewJwt = getNewJwt;
const verifyJwt = (token) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, String(process.env.TOKEN_SECRET), (error, result) => {
            if (error) {
                return reject();
            }
            resolve(result);
        });
    });
};
exports.verifyJwt = verifyJwt;
