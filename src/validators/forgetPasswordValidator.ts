import * as yup from "yup"
import { emailValidator } from "./commonValidators";
export const ForgetPasswordSchema = yup
    .object()
    .shape({
        Email: emailValidator,
    })
    .required();
export type ForgetPasswordFormData = yup.InferType<typeof ForgetPasswordSchema>;