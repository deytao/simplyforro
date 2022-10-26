import * as yup from 'yup';

export const subscriberSchema = yup.object({
  name: yup.string().required("Your name is required"),
  email: yup.string().email("You need a valid email").required("Your email is required"),
});
