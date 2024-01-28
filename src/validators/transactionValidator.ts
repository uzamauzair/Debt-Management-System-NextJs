import * as yup from "yup"
import { textValidator } from "./commonValidators";
export const transactionTypeValidator = yup
    .string()
    .oneOf(["debt", "payment"], "Transaction type must be either 'debt' or 'payment'")
    .required("Transaction type is required");
export const amountValidator = yup
    .number()
    .typeError("Amount must be a valid number")
    .required("Amount is required")
    .min(0, "Amount must be a non-negative value");
export const idValidator = yup.string().max(30).required();
export const TransactionSchema = yup.object().shape({
    Customer: idValidator,
    Description: textValidator,
    TransactionType: transactionTypeValidator,
    Amount: amountValidator
}).required();
export type TransactionFormData = yup.InferType<typeof TransactionSchema>;