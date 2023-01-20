"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appErrorJson = void 0;
const appErrorJson = (message, error) => {
    return {
        message,
        error
    };
};
exports.appErrorJson = appErrorJson;
