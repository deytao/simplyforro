import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { XIcon } from '@heroicons/react/outline'

import { Alert } from 'components/Alert'
import { EventPreview } from 'components/EventPreview'
import { MessageDialog } from 'components/MessageDialog'
import { alertService } from 'lib/alert';
import { eventSchema } from 'schemas/event';


const commonClassnames = "focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded sm:text-sm border-gray-300"
const checkboxClassnames = "focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"


const CalendarForm: NextPage = () => {
  const formOptions = { resolver: yupResolver(eventSchema) };
  const { register, handleSubmit, reset, formState, watch } = useForm(formOptions);
  const { errors } = formState;
  const [ isSubmitting, setIsSubmitting ] = useState(false)
  const [ messageDialogState, setMessageDialogState ] = useState({
    isOpen: false,
    status: "",
    title: "",
    message: "",
  });
  const event = {
      title: "FENFIT",
      url: "https://www.example.com",
      startDate: "2022-04-23",
      endDate: "",
      frequency: "",
      city: "Itaunas",
      country: "Brazil",
      categories: [
        "party",
        "class",
      ],
  }
  const [ previewState, setPreviewState ] = useState(event);

  watch((data: any, options) => {
      const newEvent = {
          title: data.title|| event.title,
          url: data.url || event.url,
          startDate: data.startDate || event.startDate,
          endDate: data.endDate || event.endDate,
          frequency: data.frequency || event.frequency,
          city: data.city || event.city,
          country: data.country || event.country,
          categories: data.categories || event.categories,
      }
      setPreviewState(newEvent)
  })

  async function submitForm(formData: object) {
      if (isSubmitting) return false
      setIsSubmitting(true)
      const endpoint = '/api/calendar/event'
      const event = eventSchema.cast(formData)
      const JSONdata = JSON.stringify(event)

      const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSONdata,
      }
      await fetch(endpoint, options)
        .then(response => {
            if (!response.ok) {
                throw new Error("An error occured, please try again later.")
            }
            return response.json()
        })
        .then(data => {
            reset()
            setMessageDialogState({
              isOpen: true,
              status: "success",
              title: "Thank you!",
              message: `
                You have created ${data.pagesCount} ${data.pagesCount > 1 ? "events" : "event"}.
                ${data.pagesCount > 1 ? "They" : "It"} will be validated and added to the calendar soon.
              `,
            })
        })
        .catch(error => {
            setMessageDialogState({
                isOpen: true,
                status: "error",
                title: "Error",
                message: error.message,
            })
        })
      return false;
  }

  const togglePreview = (el: any) => {
    const elements = document.querySelectorAll('[data-event-preview]') as NodeListOf<HTMLElement>;
    elements.forEach((el) => {
        if (el.offsetParent) {
            el.classList.add("hidden")
        }
        else {
            el.classList.remove("hidden")
        }
    })
  }

  return (
    <>
      <h1 className="text-xl md:text-6xl font-bold py-4 text-center">
        New event
      </h1>

      <MessageDialog messageDialog={messageDialogState} setMessageDialog={setMessageDialogState} />

      <div className="relative md:grid md:grid-cols-4 md:gap-4">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit(submitForm)} method="POST">
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-4 md:col-span-2">
                    <label htmlFor="event-title" className="block text-sm font-medium text-gray-700">Title</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input type="text" {...register("title")} id="event-title" className={`${commonClassnames} ${errors.title ? 'border-red-500' : ''}`} placeholder={`${event.title}`} />
                    </div>
                    <p className="text-red-500 text-xs italic">{errors.title?.message}</p>
                  </div>

                  <div className="col-span-4">
                    <label htmlFor="event-url" className="block text-sm font-medium text-gray-700"> Tickets / Infos </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input type="text" {...register("url")} id="event-url" className={`${commonClassnames} ${errors.url ? 'border-red-500' : ''}`} placeholder={`${event.url}`} />
                    </div>
                    <p className="text-red-500 text-xs italic">{errors.url?.message}</p>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="event-start-date" className="block text-sm font-medium text-gray-700">From</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input type="date" {...register("startDate")} id="event-start-date" className={`${commonClassnames} ${errors.startDate ? 'border-red-500' : ''}`} placeholder={`${event.startDate}`} />
                    </div>
                    <p className="text-red-500 text-xs italic">{errors.startDate?.message}</p>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="event-end-date" className="block text-sm font-medium text-gray-700">To</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input type="date" {...register("endDate")} id="event-end-date" className={`${commonClassnames} ${errors.endDate ? 'border-red-500' : ''}`} placeholder={`${event.endDate}`} />
                    </div>
                    <p className="text-red-500 text-xs italic">{errors.endDate?.message}</p>
                  </div>

                  <div className="col-span-4 md:col-span-2">
                    <label htmlFor="event-frequency" className="block text-sm font-medium text-gray-700">Frequency</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <select {...register("frequency")} id="event-frequency" className={`${commonClassnames}`}>
                          <option value=""></option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Biweekly</option>
                          <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <p className="text-red-500 text-xs italic">{errors.frequency?.message}</p>
                  </div>

                  <div className="col-span-4 grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label htmlFor="event-city" className="block text-sm font-medium text-gray-700">City</label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input type="text" {...register("city")} id="event-city" className={`${commonClassnames} ${errors.city ? 'border-red-500' : ''}`} placeholder={`${event.city}`} />
                      </div>
                      <p className="text-red-500 text-xs italic">{errors.city?.message}</p>
                    </div>

                    <div className="col-span-1">
                      <label htmlFor="event-country" className="block text-sm font-medium text-gray-700">Country</label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input type="text" {...register("country")} id="event-country" className={`${commonClassnames} ${errors.country ? 'border-red-500' : ''}`} placeholder={`${event.country}`} />
                      </div>
                      <p className="text-red-500 text-xs italic">{errors.country?.message}</p>
                    </div>
                  </div>
                </div>

                <fieldset>
                  <legend className="text-base font-medium text-gray-900">Category</legend>
                  <p className="text-red-500 text-xs italic">{errors.categories?.message}</p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input id="categories-party" {...register("categories")} value="party" type="checkbox" className={`${checkboxClassnames} ${errors.categories ? 'border-red-500' : ''}`} />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="categories-party" className="font-medium text-gray-700">
                            Party
                            <p className="text-gray-500 font-normal">Event where a DJ and/or a band is playing the music</p>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input id="categories-pratica" {...register("categories")} value="pratica" type="checkbox" className={`${checkboxClassnames} ${errors.categories ? 'border-red-500' : ''}`} />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="categories-pratica" className="font-medium text-gray-700">
                            Pratica
                            <p className="text-gray-500 font-normal">Event where participants are handling the music and practicing steps</p>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input id="categories-class" {...register("categories")} value="class" type="checkbox" className={`${checkboxClassnames} ${errors.categories ? 'border-red-500' : ''}`} />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="categories-class" className="font-medium text-gray-700">
                            Class
                            <p className="text-gray-500 font-normal">Regular event where a teacher is showing new steps or concepts</p>
                        </label>
                      </div>
                    </div>
                   <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input id="categories-workshop" {...register("categories")} value="workshop" type="checkbox" className={`${checkboxClassnames} ${errors.categories ? 'border-red-500' : ''}`} />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="categories-workshop" className="font-medium text-gray-700">
                            Workshop
                            <p className="text-gray-500 font-normal">Ponctual event where a guest teacher is handling the class</p>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input id="categories-festival" {...register("categories")} value="festival" type="checkbox" className={`${checkboxClassnames} ${errors.categories ? 'border-red-500' : ''}`} />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="categories-festival" className="font-medium text-gray-700">
                            Festival
                            <p className="text-gray-500 font-normal">Event generally happening over few days with workshops and parties</p>
                        </label>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
      
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button type="button" onClick={togglePreview} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mr-2 md:hidden" data-preview-panel="event-preview">Preview </button>
                <button type="submit" className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting && "cursor-not-allowed"}`} disabled={isSubmitting}>
                    {isSubmitting && 
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    }
                    {isSubmitting ? "Processing" : "Send" }
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className="hidden relative shadow p-2 md:block md:col-span-2">
          <EventPreview eventData={previewState} />
        </div>

        <div data-event-preview className="hidden fixed inset-0 bg-black/20" aria-hidden="true" onClick={togglePreview} />
        <div data-event-preview className="hidden w-11/12 h-screen fixed bottom-0 right-0 bg-white p-1 rounded-l-md shadow-xl">
          <XIcon className="h-8 w-8 absolute top-16 right-0 inline cursor-pointer" onClick={togglePreview} />
          <EventPreview eventData={previewState} />
        </div>
      </div>
    </>
  )
}

export default CalendarForm
