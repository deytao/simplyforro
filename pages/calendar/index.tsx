import moment from 'moment';
import type { NextPage } from 'next'
import Link from 'next/link'
import { useState } from 'react'
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


const Calendar: NextPage<Props> = ({ events }) => {
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
      <div className="mt-6 grid grid-cols-7 w-full border-b border-r">
        <div className="text-sm text-slate-500 text-center">Mon</div>
        <div className="text-sm text-slate-500 text-center">Tue</div>
        <div className="text-sm text-slate-500 text-center">Wed</div>
        <div className="text-sm text-slate-500 text-center">Thu</div>
        <div className="text-sm text-slate-500 text-center">Fri</div>
        <div className="text-sm text-slate-500 text-center">Sat</div>
        <div className="text-sm text-slate-500 text-center">Sun</div>

        {monthDays.map((day, idx) => {
            return <div key={`${idx}`} className={`border border-b-0 border-r-0 text-right ${["6", "7"].includes(day.format("E")) && "bg-slate-100"}`}>{day.format("D") == "1" && day.format("MMM")} {day.format("D")}</div>
        })}
      </div>
    </>
  )
}

export default Calendar
