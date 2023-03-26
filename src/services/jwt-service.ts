import { ITokenData } from '@/interfaces/common';
import { appConstants } from '@/utils/constants';
import jwt from 'jsonwebtoken';

export const getNewJwt = (payload: ITokenData) => {
    return jwt.sign(payload, String(process.env.TOKEN_SECRET), { expiresIn: appConstants.jwtExpiry })
}

export const verifyJwt = (token: string) => {
    return new Promise<any>((resolve, reject) => {
        jwt.verify(token, String(process.env.TOKEN_SECRET), (error, result) => {
            if (error) {
                return reject(error)
            }
            resolve(result)
        })
    })
}