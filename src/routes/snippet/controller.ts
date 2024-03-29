import { TListSchema } from "@/schemas/common-schemas";
import { TSnippet, SnippetCollection, TSnippetList, TSnippetComment } from "./schema";
import mongoose from "mongoose";
import { AppStrings } from "@/utils/strings";
import { IListResponse } from '../../interfaces/common';
import { getListQuery } from '../../utils/helper-functions';
import { AppConfigs } from "@/utils/configs";
import { ECollections } from "@/enums/collections";

export class SnippetController {

    public static getCodeById(id: string) {
        return new Promise<{ code: string } | null>((resolve, reject) => {
            SnippetCollection.findById(id)
                .select('code')
                .then(res => {
                    resolve(res || null);
                }).catch(err => {
                    reject(err);
                })
        })
    }

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
                        comments: 0,
                    }
                },
                { $limit: 1 }
            ])
                .exec()
                .then(res => {
                    if (res.length === 0) {
                        reject(AppStrings.notFound);
                        return;
                    }
                    resolve(res[0]);
                }).catch(err => {
                    reject(err);
                })
        })
    }

    public static getByUserId(userId: string, listQuery: TListSchema) {
        return new Promise<IListResponse<TSnippet> | null>((resolve, reject) => {
            const searchQuery = [];
            if (listQuery?.search) searchQuery.push({ $text: { $search: listQuery.search } });
            const query = SnippetCollection.aggregate([
                {
                    $match: {
                        $and: [
                            { isDeleted: false, createdBy: userId },
                            ...searchQuery
                        ]
                    }
                },
                {
                    $facet: {
                        result: [
                            {
                                $addFields: {
                                    likeCount: { $size: "$likes" },
                                    commentsCount: { $size: "$comments" },
                                    code: {
                                        $cond: [
                                            { $gte: [{ $strLenCP: "$code" }, AppConfigs.listCodeMaxLength] },
                                            {
                                                $concat: [
                                                    { $substrCP: ["$code", 0, AppConfigs.listCodeMaxLength] },
                                                    "\n\n(TRUNCATED: Please COPY or OPEN for full code)\n\n"
                                                ]
                                            },
                                            "$code"
                                        ]
                                    },
                                    selfLiked: {
                                        $in: [userId, "$likes"]
                                    }
                                }
                            },
                            ...getListQuery(listQuery, AppConfigs.defaultQueryLimit),
                            {
                                $project: {
                                    isDeleted: 0,
                                    __v: 0,
                                    likes: 0,
                                    comments: 0
                                }
                            }
                        ],
                        totalItems: [
                            { $count: 'count' } // Count the total number of documents
                        ]
                    }
                },
                {
                    $unwind: {
                        path: '$totalItems',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        totalItems: '$totalItems.count',
                        result: "$result"
                    }
                }
            ])
            query.exec()
                .then((res) => {
                    res[0].totalItems = res[0].totalItems || 0;
                    SnippetCollection.populate(res[0].result, { path: 'createdBy', model: ECollections.user })
                        .then((result) => {
                            resolve({ ...res[0], result });
                        }).catch(err => {
                            reject(err);
                        })
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
                .select('-comments -likes -code')
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
                .select('-comments -likes -code')
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
            }, { new: true })
                .select('-comments -likes -code')
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
                .select('-comments -likes -code')
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

    public static getTrending(listQuery: TListSchema, userId: string) {
        return new Promise<TSnippet[] | null>((resolve, reject) => {
            const searchQuery = [];
            if (listQuery?.search) searchQuery.push({ $text: { $search: listQuery.search } });
            const query = SnippetCollection.aggregate([
                {
                    $match: {
                        $and: [
                            { isDeleted: false, isPublic: true },
                            ...searchQuery
                        ]
                    }
                },
                {
                    $sort: { copies: -1 }
                },
                {
                    $facet: {
                        result: [
                            {
                                $addFields: {
                                    likeCount: { $size: "$likes" },
                                    commentsCount: { $size: "$comments" },
                                    code: {
                                        $cond: [
                                            { $gte: [{ $strLenCP: "$code" }, AppConfigs.listCodeMaxLength] },
                                            {
                                                $concat: [
                                                    { $substrCP: ["$code", 0, AppConfigs.listCodeMaxLength] },
                                                    "\n\n(TRUNCATED: Please COPY or OPEN for full code)\n\n"
                                                ]
                                            },
                                            "$code"
                                        ]
                                    }, // limiting code length
                                    selfLiked: {
                                        $in: [userId, "$likes"]
                                    }
                                }
                            },
                            ...getListQuery(listQuery, AppConfigs.defaultQueryLimit),
                            {
                                $project: {
                                    isDeleted: 0,
                                    __v: 0,
                                    likes: 0,
                                    comments: 0
                                }
                            }
                        ],
                        totalItems: [
                            { $count: 'count' } // Count the total number of documents
                        ]
                    }
                },
                {
                    $unwind: {
                        path: '$totalItems',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        totalItems: '$totalItems.count',
                        result: "$result"
                    }
                }
            ])
            query.exec()
                .then(res => {
                    res[0].totalItems = res[0].totalItems || 0;
                    SnippetCollection.populate(res[0].result, { path: 'createdBy', model: ECollections.user })
                        .then((result) => {
                            resolve({ ...res[0], result });
                        }).catch(err => {
                            reject(err);
                        })
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
                .select('-comments -likes -code')
                .then(res => {
                    resolve(res);
                }).catch(err => {
                    reject(err);
                });
        });
    }

    public static softDeleteById(id: string) {
        return new Promise((resolve, reject) => {
            SnippetCollection.findByIdAndUpdate(id, { isDeleted: true }).select('-comments -likes -code').then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            });
        });
    }

    public static hardDeleteById(id: string) {
        return new Promise((resolve, reject) => {
            SnippetCollection.findByIdAndDelete(id).select('-comments -likes -code').then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            });
        });
    }

}