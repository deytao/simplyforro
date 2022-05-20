import type { NextPage } from 'next'
import Link from 'next/link'
import { ArrowSmRightIcon, ExternalLinkIcon } from '@heroicons/react/outline'

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
              <div key={event.id} className="p-2 rounded hover:bg-gray-200 focus:bg-gray-200">
                  <a href={`https://simplyforro.notion.site/${event.database_id}?p=${event.id}`} className="hover:text-blue-600 focus:text-blue-600" target="_blank">
                    {event.title}
                  </a>
                  <br />
                  {event.start_date}
                  <ArrowSmRightIcon className="h-6 w-6 -mt-1 inline"/>
                  {event.end_date}
                  <br />
                  {event.location}
                  <br />
              </div>
            ))}
        </div>
        <a href={`https://simplyforro.notion.site/${process.env.NOTION_CALENDAR_DATABASE_ID}`} className="mt-4 text-xl hover:text-blue-600 focus:text-blue-600" target="_blank">
          See all
          <ExternalLinkIcon className="h-4 w-4 ml-0.5 -mt-0.5 inline"/>
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
