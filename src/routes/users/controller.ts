import { TUser, UserCollection } from "./schema";

export class UserController {
    public static getById(id: string) {
        return new Promise<TUser | null>((resolve, reject) => {
            UserCollection.findById(id).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        })
    }

    public static getByEmail(email: string, includePassword = false) {
        return new Promise<TUser | null>((resolve, reject) => {
            UserCollection.findOne({
                email
            })
                .select(includePassword ? 'password' : '')
                .exec()
                .then(res => {
                    resolve(res);
                }).catch(err => {
                    reject(err);
                })
        });
    }

    public static createOne(user: TUser) {
        return new Promise((resolve, reject) => {
            UserCollection.create(user).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        });
    }

    public static updateOne(id: string, user: TUser) {
        return new Promise((resolve, reject) => {
            UserCollection.updateOne({ _id: id }, user).then(res => {
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