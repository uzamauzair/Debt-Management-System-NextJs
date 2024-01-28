import * as yup from "yup"
import { emailValidator, passwordValidator } from "./commonValidators";
export const LoginSchema = yup
    .object()
    .shape({
        Password: passwordValidator,
        Email: emailValidator,
    })
    .required();
export type LoginFormData = yup.InferType<typeof LoginSchema>;