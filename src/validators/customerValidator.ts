import * as yup from "yup"
import { nameValidator, textValidator } from "./commonValidators";
//
// phone number regex expression
const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
//
export const phoneNumberValidator = yup.string().matches(phoneRegExp, 'Phone number is not valid').required("required").min(10, "too short")
    .max(10, "too long");
// nic regex expression
const nicRegExp = /^([0-9]{9}[x|X|v|V]|[0-9]{12})$/
export const nicValidator = yup.string().matches(nicRegExp, 'NIC is not valid').required("required");
//
export const fileValidator = yup.string().required();
//
export const CustomerSchema = yup
    .object()
    .shape({
        Username: nameValidator,
        PhoneNumber: phoneNumberValidator,
        NIC: nicValidator,
        Address: textValidator,
        NICImages: fileValidator
    })
    .required();
export type CustomerFormData = yup.InferType<typeof CustomerSchema>;