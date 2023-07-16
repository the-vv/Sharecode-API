import { ECollections } from "@/enums/collections";
import { TMongoDefault } from "@/interfaces/common";
import { model, Schema } from "mongoose";
import { z } from "zod";

export const tokenSchema = z.object({
    userId: z.string(),
    token: z.string(),
    createdAt: z.date()
})

export type TToken = z.infer<typeof tokenSchema> & TMongoDefault;

const tokenCollection = new Schema<TToken>({
    userId: { type: String, required: true, ref: ECollections.user },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 }
}, { versionKey: false });

export const TokenCollection = model<TToken>(ECollections.token, tokenCollection);