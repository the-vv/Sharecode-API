import { TListSchema } from "@/schemas/common-schemas";
import { TSnippet, SnippetCollection, TSnippetList } from "./schema";

export class SnippetController {
    public static getById(id: string) {
        return new Promise<TSnippet | null>((resolve, reject) => {
            SnippetCollection.findById(id)
                .select('-isDeleted -__v')
                .lean()
                .exec()
                .then(res => {
                    resolve(res);
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

    public static getTrending(listQuery: TListSchema) {
        return new Promise<TSnippet[] | null>((resolve, reject) => {
            const query = SnippetCollection.find({ isDeleted: false })
                .select('-isDeleted -__v')
                .sort({ views: -1 })
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
            SnippetCollection.findByIdAndUpdate(id, snippet, { new: true }).then(res => {
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