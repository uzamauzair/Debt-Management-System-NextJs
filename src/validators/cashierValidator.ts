import * as yup from "yup"
import { emailValidator, nameValidator } from "./commonValidators";

export const CashierSchema = yup
    .object()
    .shape({
        Email: emailValidator,
        Username: nameValidator,
    })
    .required();
export type CashierFormData = yup.InferType<typeof CashierSchema>;