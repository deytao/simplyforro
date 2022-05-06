import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { eventSchema } from 'schemas/event';


const CalendarForm: NextPage = () => {
  const formOptions = { resolver: yupResolver(eventSchema) };
  const { register, handleSubmit, reset, formState } = useForm(formOptions);
  const { errors } = formState;

  function submitForm(formData: object) {
      const endpoint = '/api/calendar/event'
      const data = eventSchema.cast(formData)
      const JSONdata = JSON.stringify(data)

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSONdata,
      }
      const response = fetch(endpoint, options)
        .then(response => {
          console.debug(response)
          if (response.ok) {
            reset()
            alert("Event created")
          }
        })
      return false;
  }

  return (
    <div className="md:grid md:grid-cols-3 md:gap-4">
      <div className="md:col-span-3">
        <form onSubmit={handleSubmit(submitForm)} method="POST">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label htmlFor="event-title" className="block text-sm font-medium text-gray-700">Title</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input type="text" {...register("title")} id="event-title" className={`focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded sm:text-sm border-gray-300 ${errors.title ? 'border-red-500' : ''}`} placeholder="Untitled" />
                  </div>
                  <p className="text-red-500 text-xs italic">{errors.title?.message}</p>
                </div>

                <div className="col-span-4">
                  <label htmlFor="event-link" className="block text-sm font-medium text-gray-700"> Tickets / Infos </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input type="text" {...register("link")} id="event-link" className={`focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded sm:text-sm border-gray-300 ${errors.link ? 'border-red-500' : ''}`} placeholder="https://www.example.com" />
                  </div>
                  <p className="text-red-500 text-xs italic">{errors.link?.message}</p>
                </div>

                <div className="col-span-1">
                  <label htmlFor="event-start-date" className="block text-sm font-medium text-gray-700">From</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input type="date" {...register("startDate")} id="event-start-date" className={`focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded sm:text-sm border-gray-300 ${errors.startDate ? 'border-red-500' : ''}`} placeholder="23.04.2022" />
                  </div>
                  <p className="text-red-500 text-xs italic">{errors.startDate?.message}</p>
                </div>

                <div className="col-span-1">
                  <label htmlFor="event-end-date" className="block text-sm font-medium text-gray-700">To</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input type="date" {...register("endDate")} id="event-end-date" className={`focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded sm:text-sm border-gray-300 ${errors.endDate ? 'border-red-500' : ''}`} placeholder="23.04.2022" />
                  </div>
                  <p className="text-red-500 text-xs italic">{errors.endDate?.message}</p>
                </div>

                <div className="col-span-4 grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label htmlFor="event-city" className="block text-sm font-medium text-gray-700">City</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input type="text" {...register("city")} id="event-city" className={`focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded sm:text-sm border-gray-300 ${errors.city ? 'border-red-500' : ''}`} placeholder="Itaunas" />
                    </div>
                    <p className="text-red-500 text-xs italic">{errors.city?.message}</p>
                  </div>

                  <div className="col-span-1">
                    <label htmlFor="event-country" className="block text-sm font-medium text-gray-700">Country</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input type="text" {...register("country")} id="event-country" className={`focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded sm:text-sm border-gray-300 ${errors.country ? 'border-red-500' : ''}`} placeholder="Brazil" />
                    </div>
                    <p className="text-red-500 text-xs italic">{errors.country?.message}</p>
                  </div>
                </div>
              </div>

              <fieldset>
                <legend className="text-base font-medium text-gray-900">Category</legend>
                <p className="text-red-500 text-xs italic">{errors.tags?.message}</p>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="tags-party" {...register("tags")} value="party" type="checkbox" className={`focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded ${errors.tags ? 'border-red-500' : ''}`} />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="party" className="font-medium text-gray-700">Party</label>
                      <p className="text-gray-500">Event where a DJ and/or a band is playing the music</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="tags-pratica" {...register("tags")} value="pratica" type="checkbox" className={`focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded ${errors.tags ? 'border-red-500' : ''}`} />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="tags-pratica" className="font-medium text-gray-700">Pratica</label>
                      <p className="text-gray-500">Event where participants are handling the music and practicing steps</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="tags-class" {...register("tags")} value="class" type="checkbox" className={`focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded ${errors.tags ? 'border-red-500' : ''}`} />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="tags-class" className="font-medium text-gray-700">Class</label>
                      <p className="text-gray-500">Regular event where a teacher is showing new steps or concepts</p>
                    </div>
                  </div>
                 <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="tags-workshop" {...register("tags")} value="workshop" type="checkbox" className={`focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded ${errors.tags ? 'border-red-500' : ''}`} />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="tags-workshop" className="font-medium text-gray-700">Workshop</label>
                      <p className="text-gray-500">Ponctual event where a guest teacher is handling the class</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="tags-festival" {...register("tags")} value="festival" type="checkbox" className={`focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded ${errors.tags ? 'border-red-500' : ''}`} />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="tags-festival" className="font-medium text-gray-700">Festival</label>
                      <p className="text-gray-500">Event generally happening over few days with workshops and parties</p>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
    
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CalendarForm
