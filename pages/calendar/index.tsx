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
            ...event,
            start_at: moment(event.start_at).format("YYYY-MM-DD"),
            end_at: moment(event.end_at).format("YYYY-MM-DD"),
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
  const monthWeeks: moment.Moment[][] = []
  for (let dayOfMonth = moment(startOfMonth); dayOfMonth.isSameOrBefore(endOfMonth); dayOfMonth.add(1, "week")) {
      let dayOfWeek = moment(dayOfMonth).startOf("isoWeek")
      let week = []
      for (let i = 0; i < 7; i++) {
        week.push(moment(dayOfWeek))
        dayOfWeek.add(1, "day")
      }
      monthWeeks.push(week)
  }

  const monthEvents: {[k: string]: {}[]} = {}
  staticEvents.forEach((event: any) => {
      if (!(event.start_at in monthEvents)) {
          monthEvents[event.start_at] = []
      }
      monthEvents[event.start_at].push({
          ...event,
          start_at: moment(event.start_at),
          end_at: moment(event.end_at),
      })
  })

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

        {monthWeeks.map((week: moment.Moment[], weekIdx: number) => {
            let maxEventPerDay = Math.max(...week.map((day, idx) => day.format("YYYY-MM-DD") in monthEvents ? monthEvents[day.format("YYYY-MM-DD")].length : 0))
            return (
                <div className="relative col-span-7 grid grid-cols-7 min-h-[130px]" style={{height: (17 + 87 * maxEventPerDay) + "px"}}>
                  {week.map((day: moment.Moment, dayIdx: number) => {
                      let hasEvents = day.format("YYYY-MM-DD") in monthEvents
                      return (
                          <>
                            <div key={`${weekIdx}-${dayIdx}`} className={`${["6", "7"].includes(day.format("E")) ? "bg-slate-100 " : ""}border border-b-0 border-r-0 flex flex-col`}>
                                <div className="text-right">{day.format("D") == "1" && day.format("MMM ")}{day.format("D")}</div>
                                {hasEvents && monthEvents[day.format("YYYY-MM-DD")].map((event: any, eventIdx: number) => {
                                    let numberOfDay = event.end_at.isValid() ? event.end_at.diff(event.start_at, "days") : 1
                                    return <EventDetails key={`${eventIdx}`} event={event} extraClasses={`absolute mt-2 z-50 bg-white`} extraStyles={{
                                        top: (17 + 84 * eventIdx) + "px",
                                        width: (265.15 * numberOfDay) + "px",
                                    }} />
                                })}
                            </div>
                          </>
                      )
                  })}
                </div>
            )
        })}
      </div>
    </>
  )
}

export default Calendar
