import moment from 'moment';
import type { NextPage } from 'next'
import { Event } from '@prisma/client';
import { useEffect, useState } from 'react'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline'

import { EventDetailsSimple } from 'components/EventPreview'
import { GetEvents } from 'lib/calendar'
import { categories } from 'schemas/event';


moment.locale("en", {
    "week": {
        "dow": 1,
        "doy": 1,
    },
})
const localizer = momentLocalizer(moment);

const frequencyIntervals: {[key: string]: object} = {
    "daily": {"days": 1},
    "weekly": {"weeks": 1},
    "biweekly": {"weeks": 2},
    "monthly": {"months": 1},
}

const Toolbar = ({ label, onNavigate, selectedCategories, ftsValue}) => {
  const prevMonth = () => onNavigate("PREV")
  const currentMonth = () => onNavigate("TODAY")
  const nextMonth = () => onNavigate("NEXT")
  const changeFilters = () => onNavigate()
  const taskId = undefined
  const delayFTS = () => {
      if (taskId) {
          clearTimeout(taskId)
      }
      setTimeout(onNavigate, 600)
  }
  return (
      <div className="sticky top-[65px] md:top-[80px] z-50 bg-white">
        <h1 className="text-xl md:text-6xl font-bold py-4 text-center">{label}</h1>
        <div className="relative grid grid-cols-7 gap-4 mb-2">
            <div className="col-span-4 md:col-span-1 flex items-center">
                <button type="button" onClick={prevMonth}>
                    <ChevronLeftIcon className="h-3 md:h-6 w-6 md:w-12"/>
                </button>
                <button type="button" onClick={currentMonth} className="py-1 md:py-2 px-2 md:px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Today</button>
                <button type="button" onClick={nextMonth}>
                    <ChevronRightIcon className="h-3 md:h-6 w-6 md:w-12"/>
                </button>
            </div>
            <div className="col-span-3 flex justify-center hidden">
              <input key="fts-field" type="text" onChange={changeFilters} value={ftsValue} placeholder="Search..." className="focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-1/2 rounded text-sm border-gray-300" data-filters-fts />
            </div>
            <div className="col-span-7 md:col-span-3">
                <div className="mt-2 flex items-center">
                    {categories.map((category: any, idx: number) => (
                      <div key={idx} className="flex items-center basis-1/6">
                          <input id={`categories-${category}`} type="checkbox" value={category} onChange={changeFilters} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded mr-1" data-filters-categories checked={selectedCategories.includes(category)} />
                          <label htmlFor={`categories-${category}`} className={`event-tag-${category} px-2 rounded capitalize text-sm md:text-base`}>{category}</label>
                      </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    )
}

const Calendar: NextPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedCategories, setSelectedCategories] = useState(categories)
    const [ftsValue, setFTSValue] = useState("")
    const [events, setEvents] = useState([])
    useEffect(() => {
        let lbound = moment(currentDate).startOf('month').startOf('week')
        let ubound = moment(currentDate).endOf('month').endOf('week')
        let dates = [
            `lbound=${encodeURIComponent(lbound.format('YYYY-MM-DD'))}`,
            `ubound=${encodeURIComponent(ubound.format('YYYY-MM-DD'))}`,
        ]
        let categories = ([...selectedCategories].map( (category) =>  `categories=${encodeURIComponent(category)}` ))
        let params = [...dates, ...categories, `fts=${encodeURIComponent(ftsValue)}`]
        fetch(`/api/calendar/events?${params.join("&")}`)
          .then(res => res.json())
          .then(data => {
              let events = data.map((event: Event) => {
                  if (!event.frequency) {
                      return event
                  }
                  let eventDate = moment(event.start_at)
                  let lastDate = event.end_at && moment(event.end_at) < ubound ? moment(event.end_at) : ubound
                  let events: Event[] = []
                  while (eventDate <= lastDate) {
                      if (eventDate >= lbound) {
                          events.push({
                              ...event,
                              start_at: eventDate.toDate(),
                              end_at: eventDate.toDate(),
                          })
                      }
                      eventDate.add(frequencyIntervals[event.frequency])
                  }
                  return events
              }).flat(1)
              setEvents(events)
          })
      }, [currentDate, selectedCategories, ftsValue])

    return (
        <BigCalendar
          components={{
            event: EventDetailsSimple,
            toolbar: (args) => Toolbar({...args, selectedCategories, ftsValue}),
          }}
          defaultDate={currentDate}
          defaultView="month"
          events={events.map((event: any, idx: number) => {
              return {
                ...event,
                start_at: moment(event.start_at),
                end_at: moment(event.end_at || event.start_at).endOf('day'),
                allDay: true,
              }
          })}
          localizer={localizer}
          onNavigate={(newDate) => {
              let elements = document.querySelectorAll('[data-filters-categories]:checked') as NodeListOf<HTMLInputElement>;
              let ftsInput = document.querySelector('[data-filters-fts]') as HTMLInputElement;
              setSelectedCategories([...elements].map( (el) =>  el.value ))
              setFTSValue(ftsInput ? ftsInput.value : "")
              setCurrentDate(newDate)
          }}
          startAccessor="start_at"
          endAccessor="end_at"
          showAllEvents={true}
          style={{ width: "100%" }}
          views={['month']}
        />
    )
}

export default Calendar
