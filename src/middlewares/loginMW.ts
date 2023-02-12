import { verifyJwt } from "@/services/jwt-service";
import { appErrorJson } from "@/utils/helper-functions";
import { NextFunction, Request, Response } from "express";
import { ReasonPhrases } from "http-status-codes";
import { StatusCodes } from "http-status-codes/build/cjs/status-codes";

export const loginMW = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get auth token from header bearer token
        const token = req.headers.authorization;
        if (!token?.includes('Bearer')) {
            return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(ReasonPhrases.UNAUTHORIZED));
        }
        // Get json-web-token
        const jwt = token.split(' ')?.[1];
        if (!jwt) {
            return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(ReasonPhrases.UNAUTHORIZED));
        }
        const clientData = await verifyJwt(jwt);
        res.locals.currentUser = clientData;
        next();
    } catch (err: any) {
        return res.status(StatusCodes.UNAUTHORIZED).json(appErrorJson(String(err?.message || err)));
    }
}