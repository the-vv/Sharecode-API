import { TListSchema } from "@/schemas/common-schemas";
import { TSnippet, SnippetCollection, TSnippetList, TSnippetComment } from "./schema";
import mongoose from "mongoose";

export class SnippetController {
    public static getById(id: string) {
        return new Promise<TSnippetList | null>((resolve, reject) => {
            const objectId = new mongoose.Types.ObjectId(id);
            SnippetCollection.aggregate([
                {
                    $match: { _id: objectId, isDeleted: false }
                },
                {
                    $addFields: {
                        likeCount: { $size: "$likes" },
                        commentsCount: { $size: "$comments" }
                    }
                },
                {
                    $project: {
                        isDeleted: 0,
                        __v: 0,
                        likes: 0,
                        comments: 0
                    }
                },
                { $limit: 1 }
            ])
                .exec()
                .then(res => {
                    resolve(res[0]);
                }).catch(err => {
                    reject(err);
                })
        })
    }

    public static getByUserId(userId: string, listQuery: TListSchema) {
        return new Promise<TSnippetList[] | null>((resolve, reject) => {
            const query = SnippetCollection.aggregate([
                {
                    $match: { createdBy: userId, isDeleted: false }
                },
                {
                    $addFields: {
                        likeCount: { $size: "$likes" },
                        commentsCount: { $size: "$comments" }
                    }
                },
                {
                    $project: {
                        isDeleted: 0,
                        __v: 0,
                        likes: 0,
                        comments: 0
                    }
                }
            ])
            if (listQuery?.skip && listQuery.skip > 0) query.skip(listQuery.skip);
            if (listQuery?.limit && listQuery.limit > 0) query.limit(listQuery.limit);
            if (listQuery?.sort) query.sort({ [listQuery.sort]: listQuery.order || 'asc' });
            query.exec()
                .then((res: TSnippetList[] | null) => {
                    resolve(res);
                }).catch((err: any) => {
                    reject(err);
                })
        })
    }

    public static incrementViewCopy(id: string, isCopy: boolean) {
        return new Promise((resolve, reject) => {
            SnippetCollection.findByIdAndUpdate(id, {
                $inc: {
                    views: isCopy ? 0 : 1,
                    copies: isCopy ? 1 : 0
                }
            }, { new: true })
            .select('views copies')
            .then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        })
    }

    public static addLike(id: string, userId: string) {
        return new Promise((resolve, reject) => {
            SnippetCollection.findByIdAndUpdate(id, {
                $addToSet: { likes: userId }
            }, { new: true })
            .select('likes')
            .then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        })
    }

    public static removeLike(id: string, userId: string) {
        return new Promise((resolve, reject) => {
            SnippetCollection.findByIdAndUpdate(id, {
                $pull: { likes: userId }
            }, { new: true })
            .select('likes')
            .then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        })
    }

    public static addComment(id: string, comment: TSnippetComment) {
        return new Promise((resolve, reject) => {
            SnippetCollection.findByIdAndUpdate(id, {
                $addToSet: { comments: comment }
            }, { new: true})
            .select('comments')
            .then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        })
    }

    public static removeComment(id: string, commentId: string) {
        return new Promise((resolve, reject) => {
            SnippetCollection.findByIdAndUpdate(id, {
                $pull: {
                    comments: { _id: commentId }
                }
            }, { new: true })
                .select('comments')
                .then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        })
    }

    public static getComments(id: string) {
        return new Promise<TSnippetComment[] | null>((resolve, reject) => {
            SnippetCollection.findById(id)
                .select('comments')
                .sort({ 'comments.createdAt': -1 })
                .populate(['comments.createdBy'])
                .then(res => {
                    resolve(res?.comments || null);
                }).catch(err => {
                    reject(err);
                })
        })
    }

    public static getLikes(id: string) {
        return new Promise<string[] | null>((resolve, reject) => {
            SnippetCollection.findById(id)
                .select('likes')
                .populate('likes')
                .then(res => {
                    resolve(res?.likes || null);
                }).catch(err => {
                    reject(err);
                })
        })
    }

    public static getTrending(listQuery: TListSchema) {
        return new Promise<TSnippet[] | null>((resolve, reject) => {
            const query = SnippetCollection.aggregate([
                {
                    $match: { isDeleted: false }
                },
                {
                    $sort: { copies: -1 }
                },
                {
                    $addFields: {
                        likeCount: { $size: "$likes" },
                        commentsCount: { $size: "$comments" }
                    }
                },
                {
                    $project: {
                        isDeleted: 0,
                        __v: 0,
                        likes: 0,
                        comments: 0
                    }
                }
            ])
            if (listQuery?.skip && listQuery.skip > 0) query.skip(listQuery.skip);
            if (listQuery?.limit && listQuery.limit > 0) query.limit(listQuery.limit);
            if (listQuery?.sort) query.sort({ [listQuery.sort]: listQuery.order || 'asc' });
            query.exec()
                .then(res => {
                    resolve(res);
                }).catch(err => {
                    reject(err);
                })
        })
    }

    public static createOne(snippet: TSnippet) {
        return new Promise<TSnippet | null>((resolve, reject) => {
            SnippetCollection.create(snippet).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            });
        });
    }

    public static updateOne(id: string, snippet: TSnippet) {
        return new Promise((resolve, reject) => {
            SnippetCollection.findByIdAndUpdate(id, snippet, { new: true })
            .select('-comments -likes')
            .then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            });
        });
    }

    public static softDeleteById(id: string) {
        return new Promise((resolve, reject) => {
            SnippetCollection.findByIdAndUpdate(id, { isDeleted: true }).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            });
        });
    }

    public static hardDeleteById(id: string) {
        return new Promise((resolve, reject) => {
            SnippetCollection.findByIdAndDelete(id).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            });
        });
    }

}