import Zod from "zod"
import { generateErrorMessage } from "zod-error/lib/functions";
import { AppStrings } from "./strings";

export const appErrorJson = (message: string, error?: any) => {

    if (error instanceof Zod.ZodError) {
        error = generateErrorMessage(error.issues, { delimiter: { error: ', ' }, code: { enabled: false } });
        message = AppStrings.validationErrorsOccurred;
    }
    return {
        message,
        error: error ?? ""
    }
}