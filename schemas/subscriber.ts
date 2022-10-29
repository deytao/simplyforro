import * as yup from 'yup';

export const subscriberSchema = yup.object({
  name: yup.string().required("Your name is required"),
  email: yup.string().email("You need a valid email").required("Your email is required"),
  subscriptions: yup
    .array()
    .of(yup.string())
    .nullable()
    .transform((curr, orig) => orig === false ? null : curr),
});
