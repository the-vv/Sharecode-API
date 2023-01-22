import Zod from "zod"
import { generateErrorMessage } from "zod-error/lib/functions";

export const appErrorJson = (message: string, error?: any) => {

    if (error instanceof Zod.ZodError) {
        error = generateErrorMessage(error.issues, { delimiter: { error: ', ' } });
    }
    return {
        fail: true,
        message,
        error: error ?? ""
    }
}