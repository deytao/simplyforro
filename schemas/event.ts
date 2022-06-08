import * as yup from 'yup';
import moment from 'moment';


const toISODateOrNull = (currentValue: string, originalValue: string) => {
    const date = moment(originalValue)
    return date.isValid() ? date.format("YYYY-MM-DD") : null
}


export const categories = ["party", "pratica", "class", "workshop", "festival"]
export const frequencies = ["", "daily", "weekly", "biweekly", "monthly"]

export const eventSchema = yup.object({
  title: yup.string().required("A title is required"),
  start_at: yup
  .string()
  .nullable()
  .transform(toISODateOrNull)
  .required("A valid date is required"),
  end_at: yup
  .string()
  .nullable()
  .transform(toISODateOrNull)
  .test((value: any, context) => {
      let start_at = moment(context.parent.start_at)
      let end_at = moment(value)
      let frequency = context.parent.frequency
      if (end_at.isValid()) {
          if (end_at.isSameOrAfter(start_at)) {
              return true
          }
          return context.createError({ message: "The date needs to be later than the start" })
      }
      if (frequency !== "") {
          return context.createError({ message: "An end date is mandatory with frequency" })
      }
      if (value === null) {
          return true
      }
      return context.createError({ message: "A valid date is required" })
  }),
  frequency: yup
    .string()
    .nullable()
    .oneOf(frequencies),
  city: yup.string().required("A city is required"),
  country: yup.string().required("A country is required"),
  categories: yup
    .array()
    .of(yup.string().oneOf(categories))
    .nullable()
    .transform((curr, orig) => orig === false ? null : curr)
    .required("You need to choose at least one category"),
  url: yup.string().url().nullable(),
});

export interface Event extends yup.InferType<typeof eventSchema> {}
