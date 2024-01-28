import * as yup from "yup"

export const emailValidator = yup
    .string()
    .email("Invalid email address")
    .required("Email is required");

export const nameValidator = yup.string().min(7).max(100).required();

export const textValidator = yup.string().min(10).max(500).required();
export const passwordValidator = yup
    .string()
    .required("Password is required")
    .min(10, "Password must be at least 10 characters long")
    .max(100, "Password must not exceed 100 characters")
    .matches(/[A-Z]/, "Password must have at least one uppercase character")
    .matches(/[a-z]/, "Password must have at least one lowercase character")
    .matches(/[0-9]/, "Password must have at least one number")
    .matches(/[!@#\$%\^&\*\(\)\-_+=\[\]\{\}\\\|:;"'<>,.?/]/, "Password must have at least one special character")
    ;
export const idValidator = yup.number();