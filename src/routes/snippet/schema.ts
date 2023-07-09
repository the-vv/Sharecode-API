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
    isPublic: z.boolean().optional(),
    createdBy: z.string().regex(appConfigs.mongoDBIdRegexp).optional(),
})

export type TUser = z.infer<typeof snippetSchema> & TMongoDefault;

const userCollection = new Schema<TUser>({
    
});

export const UserCollection = model<TUser>(ECollections.user, userCollection);
