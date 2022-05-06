import * as yup from 'yup';
import moment from 'moment';


const toDateOrNull = (currentValue: string, originalValue: string) => {
    const date = moment(originalValue)
    return date.isValid() ? date : null
}

const toISODate = (currentValue: any, originalValue: string) => {
    return currentValue === null ? null : currentValue.format("YYYY-MM-DD")
}

export const tags = ["party", "pratica", "class", "workshop", "festival"]
export const frequencies = ["", "daily", "weekly", "biweekly", "monthly"]

export const eventSchema = yup.object({
  title: yup.string().required("A title is required"),
  startDate: yup
  .string()
  .nullable()
  .transform(toDateOrNull)
  .required("A date is required")
  .transform(toISODate),
  endDate: yup
  .string()
  .nullable()
  .transform(toDateOrNull)
  .test((value: any) => {
      if (value === null) {
          if (yup.ref("frequency") !== null) {
              return true
          }
          return false
      }
      const endDate = moment(value)
      const startDate = moment(yup.ref("startDate"))
      if (endDate.isAfter(startDate)) {
          return true
      }
      return false
  })
  .transform(toISODate),
  frequency: yup
    .string()
    .nullable()
    .oneOf(frequencies),
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
