import * as yup from "yup";


export const roles = ["contributor", "student", "teacher"];

export const userSchema = yup.object({
    id: yup.string().nullable(),
    name: yup.string().required("A name is required"),
    email: yup.string().email("You need a valid email").required("Your email is required"),
    subscriptions: yup
        .array()
        .of(yup.string().oneOf(roles))
        .nullable()
        .transform((curr, orig) => (orig === false ? null : curr)),
});

export interface UserInter extends yup.InferType<typeof userSchema> {}
