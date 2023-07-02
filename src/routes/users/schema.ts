import { ECollections } from "@/enums/collections";
import { TMongoDefault } from "@/interfaces/common";
import { appConfigs } from "@/utils/configs";
import { model, Schema } from "mongoose";
import { z } from "zod";

export const userSchema = z.object({
    fullName: z.string().min(appConfigs.userNameMinlength).max(100),
    password: z.string().min(appConfigs.passwordMinLength).max(100).optional(),
    email: z.string().email(),
    image: z.string().optional().nullable()
})

export type TUser = z.infer<typeof userSchema> & TMongoDefault;

const userCollection = new Schema<TUser>({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: false, default: null },
    password: { type: String, required: false, select: false }
});

export const UserCollection = model<TUser>(ECollections.user, userCollection);
