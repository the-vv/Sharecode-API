import { SortOrder } from "@/enums/commons";
import { z } from "zod";

export const ListSchema = z.object({
    skip: z.number(),
    limit: z.number(),
    search: z.string().optional(),
    sort: z.string().optional(),
    order: z.nativeEnum(SortOrder).optional(),
})