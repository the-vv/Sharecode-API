import { ECollections } from "@/enums/collections";
import { TMongoDefault } from "@/interfaces/common";
import { appConfigs } from "@/utils/configs";
import { model, Schema } from "mongoose";
import { z } from "zod";

export const snippetSchema = z.object({
    title: z.string().max(500).optional(),
    code: z.string().max(appConfigs.codeMaxLengthFree),
    summary: z.string().max(1000).optional(),
    language: z.string().max(100).optional(),
    tags: z.array(z.string().max(100)).optional(),
    isPublic: z.boolean(),
    createdBy: z.string().regex(appConfigs.mongoDBIdRegexp),
    copies: z.number().optional(),
    views: z.number().optional(),
    comments: z.array(z.string().regex(appConfigs.mongoDBIdRegexp)).optional(),
    likes: z.array(z.string().regex(appConfigs.mongoDBIdRegexp)).optional(),
    isDeleted: z.boolean().optional(),
    createdAt: z.date().optional()
})

export type TSnippet = z.infer<typeof snippetSchema> & TMongoDefault;

export type TSnippetList = Omit<TSnippet, 'comments' | 'likes'> & { commentsCount: number, likesCount: number } & TMongoDefault;

const snippetCollection = new Schema<TSnippet>({
    title: { type: String, required: false, default: null },
    code: { type: String, required: true },
    summary: { type: String, required: false, default: null },
    language: { type: String, required: false, default: null },
    tags: [{ type: String, required: false, default: null }],
    isPublic: { type: Boolean, required: true, default: false },
    createdBy: { type: String, required: true },
    copies: { type: Number, required: false, default: 0 },
    views: { type: Number, required: false, default: 0 },
    comments: [{ type: String, required: false, default: null }],
    likes: [{ type: String, required: false, default: null }],
    isDeleted: { type: Boolean, required: false, default: false },
    createdAt: { type: Date, required: true, default: Date.now }
});

export const SnippetCollection = model<TSnippet>(ECollections.snippet, snippetCollection);

