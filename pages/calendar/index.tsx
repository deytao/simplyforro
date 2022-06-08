import moment from 'moment';
import type { NextPage } from 'next'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline'

import { EventDetails } from 'components/EventPreview'
import { GetEvents } from 'lib/calendar'


interface Props {
    staticEvents: any
}

export const getStaticProps = async () => {
  const events = await GetEvents()

  return {
    props: {
      staticEvents: events.map((event: any, idx: number) => {
          return {
            title: event.title,
            url: event.url,
            start_at: event.start_at.toString(),
            end_at: event.end_at,
            city: event.city,
            country: event.country,
            tags: event.categories,
          }
      }),
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every second
    revalidate: 600, // In seconds
  };
};


const Calendar: NextPage<Props> = ({ staticEvents }) => {
  const [ currentMonth, setCurrentMonth ] = useState(moment())
  const startOfMonth = moment(currentMonth).startOf("month")
  const endOfMonth = moment(currentMonth).endOf("month")
  const monthDays = []
  for (let week = moment(startOfMonth); week.isSameOrBefore(endOfMonth); week.add(1, "week")) {
      let day = moment(week).startOf("isoWeek")
      for (let i = 0; i < 7; i++) {
        monthDays.push(moment(day))
        day.add(1, "day")
      }
  }

  return (
    <>
      <h1 className="text-xl md:text-6xl font-bold py-4 text-center">
        Calendar
      </h1>

      <div className="grid grid-cols-2 w-full">
        <div className="text-left text-sm font-bold">{currentMonth.format("MMMM YYYY")}</div>
        <div className="text-right">
            <ChevronLeftIcon onClick={() => setCurrentMonth(moment(currentMonth).subtract(1, "month"))} className="inline-block px-1 rounded text-slate-500 h-6 hover:bg-slate-200 hover:cursor-pointer" />
            <span onClick={() => setCurrentMonth(moment())} className="inline-block px-1 rounded hover:bg-slate-200 hover:cursor-pointer">Today</span>
            <ChevronRightIcon onClick={() => setCurrentMonth(moment(currentMonth).add(1, "month"))} className="inline-block px-1 rounded text-slate-500 h-6 hover:bg-slate-200 hover:cursor-pointer" />
        </div>
      </div>

      <div className="grid grid-cols-7 w-full border-b border-r">
        <div className="text-sm text-slate-500 text-center">Mon</div>
        <div className="text-sm text-slate-500 text-center">Tue</div>
        <div className="text-sm text-slate-500 text-center">Wed</div>
        <div className="text-sm text-slate-500 text-center">Thu</div>
        <div className="text-sm text-slate-500 text-center">Fri</div>
        <div className="text-sm text-slate-500 text-center">Sat</div>
        <div className="text-sm text-slate-500 text-center">Sun</div>

        {monthDays.map((day, idx) => {
            return (
                <div key={`${idx}`} className={`border border-b-0 border-r-0 text-right ${["6", "7"].includes(day.format("E")) && "bg-slate-100"}`}>
                    {day.format("D") == "1" && day.format("MMM")} {day.format("D")}
                    {idx % 2 == 0 && <EventDetails event={staticEvents[0]} /> }
                </div>
            )
        })}
      </div>
    </>
  )
}

export default Calendar
