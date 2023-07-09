import { SortOrder } from "@/enums/commons";
import { z } from "zod";

export const ListSchema = z.object({
    skip: z.number().optional(),
    limit: z.number().optional(),
    search: z.string().optional(),
    sort: z.string().optional(),
    order: z.nativeEnum(SortOrder).optional(),
})

export type TListSchema = z.infer<typeof ListSchema>;