import type { NextPage } from 'next'
import Link from 'next/link'

import { getNextEvents } from 'lib/notion'


interface Props {
    events: any
}


export const getStaticProps = async () => {
  const events = await getNextEvents(`${process.env.NOTION_CALENDAR_DATABASE_ID}`);

  return {
    props: {
      events: events,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every second
    revalidate: 600, // In seconds
  };
};


const Home: NextPage<Props> = ({ events }) => {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 max-w-4xl sm:w-full">

      <div className="rounded-xl border p-6 text-left">
        <h3 className="text-2xl font-bold">Next week events</h3>
        <div className="overflow-y-auto h-60 rounded p-2 border bg-gray-100">
            {events.map((event: any) => (
              <div className="p-2 rounded hover:bg-gray-200 focus:bg-gray-200">
                  <a href={`https://simplyforro.notion.site/${event.database_id}?p=${event.id}`} className="hover:text-blue-600 focus:text-blue-600" target="_blank">
                    {event.title}
                  </a>
                  <br />
                  {event.start_date}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 -mt-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  {event.end_date}
                  <br />
                  {event.location}
                  <br />
              </div>
            ))}
        </div>
        <a href={`https://simplyforro.notion.site/${process.env.NOTION_CALENDAR_DATABASE_ID}`} className="mt-4 text-xl hover:text-blue-600 focus:text-blue-600" target="_blank">
          See all
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-0.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <Link href="/calendar/form">
          <a
            className="rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Add events</h3>
            <p className="mt-4 text-xl">
                Help us inform the community about the next dances.
            </p>
          </a>
      </Link>

    </div>
  )
}

export default Home
