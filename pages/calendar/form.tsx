import type { NextPage } from 'next'
import { GetServerSideProps } from 'next'
import { InferGetServerSidePropsType } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import {Client} from '@notionhq/client';


const client = new Client({
    auth: process.env.NOTION_ACCESS_TOKEN,
});


async function posts() {
    const myPosts = await client.databases.query({
        database_id: `${process.env.NOTION_EVENT_DATABASE_ID}`,
    });
    return myPosts;
}


export async function getServerSideProps() {
   // Get the posts
   let { results } = await posts();
   // Return the result
   return {
     props: {
       posts: results
     }
   }
}


interface Props {
    posts: [any]
}


const CalendarForm: NextPage<Props> = (props ) => {
  console.log(props)
  return (
    <div className="md:grid md:grid-cols-3 md:gap-6">
      <div className="md:col-span-3">
        <form action="/api/calendar/event" method="POST">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3 sm:col-span-2">
                  <label htmlFor="event-title" className="block text-sm font-medium text-gray-700">Title</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input type="text" name="title" id="event-title" className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300" placeholder="Untitled" required />
                  </div>
                </div>

                <div className="col-span-3 sm:col-span-2">
                  <label htmlFor="event-date" className="block text-sm font-medium text-gray-700">Date</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input type="text" name="date" id="event-date" className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300" placeholder="23.04.2022" required />
                  </div>
                </div>

                <div className="col-span-3 sm:col-span-2">
                  <label htmlFor="event-link" className="block text-sm font-medium text-gray-700"> Tickets / Infos </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"> http:// </span>
                    <input type="text" name="link" id="event-link" className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300" placeholder="www.example.com" />
                  </div>
                </div>

                <div className="col-span-3 sm:col-span-2">
                  <label htmlFor="event-city" className="block text-sm font-medium text-gray-700">City</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input type="text" name="city" id="event-city" className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300" placeholder="Itaunas" required />
                  </div>
                </div>

                <div className="col-span-3 sm:col-span-2">
                  <label htmlFor="event-country" className="block text-sm font-medium text-gray-700">Country</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input type="text" name="country" id="event-country" className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300" placeholder="Brazil" required />
                  </div>
                </div>
              </div>

              <fieldset>
                <legend className="text-base font-medium text-gray-900">Tags</legend>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="tags-party" name="tags" value="party" type="checkbox" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="party" className="font-medium text-gray-700">Party</label>
                      <p className="text-gray-500">Event where a DJ and/or a band is playing the music</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="tags-pratica" name="tags" value="pratica" type="checkbox" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="tags-pratica" className="font-medium text-gray-700">Pratica</label>
                      <p className="text-gray-500">Event where participants are handling the music and practicing steps</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="tags-class" name="tags" value="class" type="checkbox" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="tags-class" className="font-medium text-gray-700">Class</label>
                      <p className="text-gray-500">Regular event where a teacher is showing new steps or concepts</p>
                    </div>
                  </div>
                 <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="tags-workshop" name="tags" value="workshop" type="checkbox" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="tags-workshop" className="font-medium text-gray-700">Workshop</label>
                      <p className="text-gray-500">Ponctual event where a guest teacher is handling the class</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="tags-festival" name="tags" value="festival" type="checkbox" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
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
