import * as yup from 'yup';

const tags = ["party", "pratica", "class", "workshop", "festival"]
export const eventSchema = yup.object({
  title: yup.string().required("A title is required"),
  startDate: yup
  .date()
  .nullable()
  .transform((curr, orig) => orig === '' ? null : curr)
  .required("A date is required"),
  endDate: yup
  .date()
  .nullable()
  .transform((curr, orig) => orig === '' ? null : curr),
  city: yup.string().required("A city is required"),
  country: yup.string().required("A country is required"),
  tags: yup
    .array()
    .of(yup.string().oneOf(tags))
    .nullable()
    .transform((curr, orig) => orig === false ? null : curr)
    .required("You need to choose at least one category"),
  link: yup.string().url().nullable(),
});

export interface Event extends yup.InferType<typeof eventSchema> {}
