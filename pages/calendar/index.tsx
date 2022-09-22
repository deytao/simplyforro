import moment from 'moment';
import type { NextPage } from 'next'
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

const Toolbar = ({ label, onNavigate, selectedCategories}) => {
  const prevMonth = () => {
      onNavigate("PREV")
  }
  const currentMonth = () => {
      onNavigate("TODAY")
  }
  const nextMonth = () => {
      onNavigate("NEXT")
  }
  const changeFilters = () => {
    onNavigate("test")
  }
  return (
      <>
        <h1 className="text-xl md:text-6xl font-bold py-4 text-center">{label}</h1>
        <div className="relative grid grid-cols-7 gap-4 mb-2">
            <div className="col-span-1 flex items-center">
                <button type="button" onClick={prevMonth}>
                    <ChevronLeftIcon className="h-6 w-12"/>
                </button>
                <button type="button" onClick={currentMonth} className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Today</button>
                <button type="button" onClick={nextMonth}>
                    <ChevronRightIcon className="h-6 w-12"/>
                </button>
            </div>
            <div className="col-span-3">
                <div className="mt-2 flex items-center">
                    {categories.map((category: any, idx: number) => (
                      <div key={idx} className="flex items-center basis-1/6">
                          <input id={`categories-${category}`} type="checkbox" value={category} onChange={changeFilters} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded mr-1" data-filters-categories checked={selectedCategories.includes(category)} />
                          <label htmlFor={`categories-${category}`}className="font-medium text-gray-700 capitalize">{category}</label>
                      </div>
                    ))}
                </div>
            </div>
            <div className="col-span-3 flex justify-center">
              <input type="text" onChange={changeFilters} placeholder="Search..." className="focus:ring-indigo-500 focus:border-indigo-500 w-1/2 rounded sm:text-sm border-gray-300" />
            </div>
        </div>
      </>
    )
}

const Calendar: NextPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedCategories, setSelectedCategories] = useState(categories)
    const [events, setEvents] = useState([])
    useEffect(() => {
        let lbound = moment(currentDate).startOf('month').startOf('week').format('YYYY-MM-DD')
        let ubound = moment(currentDate).endOf('month').endOf('week').format('YYYY-MM-DD')
        let dates = [
            `lbound=${encodeURIComponent(lbound)}`,
            `ubound=${encodeURIComponent(ubound)}`,
        ]
        let categories = ([...selectedCategories].map( (category) =>  `categories=${encodeURIComponent(category)}` ))
        let params = [...dates, ...categories]
        fetch(`/api/calendar/events?${params.join("&")}`)
          .then(res => res.json())
          .then(data => setEvents(data))
      }, [currentDate, selectedCategories])

    return (
        <BigCalendar
          components={{
            event: EventDetailsSimple,
            toolbar: (args) => Toolbar({...args, selectedCategories}),
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
              setSelectedCategories([...elements].map( (el) =>  el.value ))
              setCurrentDate(newDate)
          }}
          startAccessor="start_at"
          endAccessor="end_at"
          style={{ height: "100vh", width: "100%" }}
          views={['month']}
        />
    )
}

export default Calendar
