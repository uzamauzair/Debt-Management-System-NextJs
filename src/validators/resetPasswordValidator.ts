import * as yup from "yup"
import { passwordValidator } from "./commonValidators";

export const otpValidtor = yup.string().min(1).max(6).required();
export const ResetPasswordSchema = yup
    .object()
    .shape({
        OTP: otpValidtor,
        Password: passwordValidator,
    })
    .required();
export type ResetPasswordFormData = yup.InferType<typeof ResetPasswordSchema>;