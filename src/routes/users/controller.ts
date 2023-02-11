import { TUser, UserCollection } from "./schema";

export class UserController {
    public static getById(id: string) {
        return new Promise<TUser | null>((resolve, reject) => {
            UserCollection.findById(id)
                .lean()
                .exec()
                .then(res => {
                    resolve(res);
                }).catch(err => {
                    reject(err);
                })
        })
    }

    public static getByEmailAuth(email: string, includePassword = false) { // Used for login and signup
        return new Promise<TUser | null>((resolve, reject) => {
            UserCollection.findOne({ email }, { password: Number(includePassword) })
                .select('email fullName')
                .lean()
                .exec()
                .then(res => {
                    resolve(res);
                }).catch(err => {
                    reject(err);
                })
        });
    }

    public static createOne(user: TUser) {
        return new Promise<TUser | null>((resolve, reject) => {
            UserCollection.create(user).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        });
    }

    public static updateOne(id: string, user: TUser) {
        return new Promise((resolve, reject) => {
            UserCollection.findByIdAndUpdate(id, user, { new: true }).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        });
    }

    public static deleteById(id: string) {
        return new Promise((resolve, reject) => {
            UserCollection.findByIdAndDelete(id).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        });
    }
}