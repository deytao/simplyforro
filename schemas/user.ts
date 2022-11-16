import * as yup from "yup";
import { Role } from "@prisma/client";

export const userSchema = yup.object({
    id: yup.string().nullable(),
    name: yup.string().required("A name is required"),
    email: yup.string().email("You need a valid email").required("Your email is required"),
    roles: yup
        .array()
        .of(yup.string().oneOf(Object.keys(Role)))
        .nullable()
        .transform((curr, orig) => (orig === false ? null : curr)),
});

export const subscriptionsSchema = yup.object({
    id: yup.string().nullable(),
    subscriptions: yup
        .array()
        .of(yup.string())
        .nullable()
        .transform((curr, orig) => (orig === false ? null : curr)),
});
