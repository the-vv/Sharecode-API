import { ECollections } from "@/enums/collections";
import { TMongoDefault } from "@/interfaces/common";
import { AppConfigs } from "@/utils/configs";
import { model, Schema } from "mongoose";
import { z } from "zod";

export const CommentsSchema = z.object({
    comment: z.string().max(1000),
    createdAt: z.date().optional(),
    createdBy: z.string().regex(AppConfigs.mongoDBIdRegexp)
})

export const snippetSchema = z.object({
    title: z.string().max(500).optional(),
    code: z.string().max(AppConfigs.codeMaxLengthFree),
    summary: z.string().max(1000).optional(),
    language: z.string().max(100).optional(),
    tags: z.array(z.string().max(100)).max(10).optional(),
    isPublic: z.boolean(),
    createdBy: z.string().regex(AppConfigs.mongoDBIdRegexp),
    copies: z.number().optional(),
    views: z.number().optional(),
    comments: z.array(CommentsSchema).optional(),
    likes: z.array(z.string().regex(AppConfigs.mongoDBIdRegexp)).optional(),
    isDeleted: z.boolean().optional(),
    createdAt: z.date().optional()
})

export type TSnippet = z.infer<typeof snippetSchema> & TMongoDefault;

export type TSnippetList = Omit<TSnippet, 'comments' | 'likes'> & { commentsCount: number, likesCount: number } & TMongoDefault;

export type TSnippetComment = z.infer<typeof CommentsSchema> & TMongoDefault;

const snippetCollection = new Schema<TSnippet>({
    title: { type: String, required: false, default: null },
    code: { type: String, required: true },
    summary: { type: String, required: false, default: null },
    language: { type: String, required: false, default: null },
    tags: [{ type: String, required: false, default: [] }],
    isPublic: { type: Boolean, required: true, default: false },
    createdBy: { type: String, required: true },
    copies: { type: Number, required: false, default: 0 },
    views: { type: Number, required: false, default: 0 },
    comments: [{
        type: {
            comment: { type: String, required: true },
            createdAt: { type: Date, required: false, default: Date.now },
            createdBy: { type: String, required: true, ref: ECollections.user }
        },
        required: false,
        default: []
    }],
    likes: [{
        type: String,
        required: false,
        default: [],
        ref: ECollections.user
    }],
    isDeleted: { type: Boolean, required: false, default: false },
    createdAt: { type: Date, required: true, default: Date.now }
}, { versionKey: false });

export const SnippetCollection = model<TSnippet>(ECollections.snippet, snippetCollection);

SnippetCollection.collection.createIndex({
    title: "text",
    code: "text",
    summary: "text"
}, {
    name: "snippet_search_index",
    default_language: "en",
    language_override: "en"
});
