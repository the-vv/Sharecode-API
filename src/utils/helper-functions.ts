import Zod from "zod"
import { generateErrorMessage } from "zod-error/lib/functions";
import { AppStrings } from "./strings";
import { TListSchema } from "@/schemas/common-schemas";

export const appErrorJson = (message: string, error?: any) => {

    if (error instanceof Zod.ZodError) {
        error = generateErrorMessage(error.issues, {
            delimiter: { error: ', ' }, code: { enabled: false }, transform: (params) => {
                return `${params.pathComponent.split(':')[1].trim()}: ${params.messageComponent.split(':').slice(1).join(':').trim()}`
            }
        });
        message = AppStrings.validationErrorsOccurred;
    }
    return {
        message,
        error: error ?? ""
    }
}

const getSortOrder = (order: string) => {
    return order === 'asc' ? 1 : -1;
}

export const getListQuery = (listQuery: TListSchema, defaultLimit?: number) => {
    const listQueries: any[] = []
    if (listQuery?.sort && listQuery?.order) listQueries.push({ $sort: { [listQuery.sort]: getSortOrder(listQuery.order) } });
    if (listQuery?.skip && listQuery.skip > 0) listQueries.push({ $skip: listQuery.skip });
    if (listQuery?.limit && listQuery.limit > 0) listQueries.push({ $limit: listQuery.limit });
    if (!listQuery?.limit && typeof defaultLimit === 'number') listQueries.push({ $limit: defaultLimit });
    return listQueries;
}