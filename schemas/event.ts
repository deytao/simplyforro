import * as yup from 'yup';
import moment from 'moment';


const toISODateOrNull = (currentValue: string, originalValue: string) => {
    const date = moment(originalValue)
    return date.isValid() ? date.format("YYYY-MM-DD") : null
}


export const tags = ["party", "pratica", "class", "workshop", "festival"]
export const frequencies = ["", "daily", "weekly", "biweekly", "monthly"]

export const eventSchema = yup.object({
  title: yup.string().required("A title is required"),
  startDate: yup
  .string()
  .nullable()
  .transform(toISODateOrNull)
  .required("A date is required"),
  endDate: yup
  .string()
  .nullable()
  .transform(toISODateOrNull)
  .test((value: any, context) => {
      let startDate = moment(context.parent.startDate)
      let endDate = moment(value)
      let frequency = context.parent.frequency
      if (endDate.isValid()) {
          if (endDate.isSameOrAfter(startDate)) {
              return true
          }
          return false
      }
      if (frequency !== "") {
          return false
      }
      if (value === null) {
          return true
      }
      return false
  }),
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
