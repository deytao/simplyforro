import moment from 'moment';
import type { NextPage } from 'next'
import Link from 'next/link'
import { Event } from '@prisma/client';
import { useEffect, useState } from 'react'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import { ArrowTopRightOnSquareIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

import { EventDetailsSimple } from 'components/EventPreview'
import { MessageDialog } from 'components/MessageDialog'
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

const Toolbar = ({ label, onNavigate, selectedCategories, ftsValue}: {label: string, onNavigate: any, selectedCategories: string[], ftsValue: string}) => {
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
      <div className="sticky top-[64px] md:top-[80px] z-50 bg-white">
        <h1 className="text-xl md:text-6xl font-bold py-4 text-center">{label}</h1>
        <div className="relative grid grid-cols-7 gap-x-4 mb-2">
            <div className="col-span-4 md:col-span-2 flex items-center order-1">
                <button type="button" onClick={prevMonth}>
                    <ChevronLeftIcon className="h-3 md:h-6 w-6 md:w-12"/>
                </button>
                <button type="button" onClick={currentMonth} className="btn btn-neutral">Today</button>
                <button type="button" onClick={nextMonth}>
                    <ChevronRightIcon className="h-3 md:h-6 w-6 md:w-12"/>
                </button>
            </div>
            <div className="col-span-3 flex justify-center hidden">
              <input key="fts-field" type="text" onChange={changeFilters} value={ftsValue} placeholder="Search..." className="focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-1/2 rounded text-sm border-gray-300" data-filters-fts />
            </div>
            <div className="col-span-7 md:col-span-3 order-3 md:order-2 p-1">
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    {categories.map((category: any, idx: number) => (
                      <div key={idx} className="flex items-center basis-1/6">
                          <input id={`categories-${category}`} type="checkbox" value={category} onChange={changeFilters} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded mr-1" data-filters-categories checked={selectedCategories.includes(category)} />
                          <label htmlFor={`categories-${category}`} className={`event-tag-${category} px-2 rounded capitalize text-sm md:text-base`}>{category}</label>
                      </div>
                    ))}
                </div>
            </div>
            <div className="col-start-6 md:col-end-8 col-span-2 md:col-span-1 order-2 md:order-3 pr-2 grid items-center justify-items-end">
              <Link href="/calendar/form">
                  <a className="btn btn-violet md:mr-5">Add</a>
              </Link>
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
    const [ messageDialogState, setMessageDialogState ] = useState<{isOpen: boolean, status: string, title: string, message: any}>({
        isOpen: false,
        status: "",
        title: "",
        message: "",
    });
    useEffect(() => {
        let lbound = moment(currentDate).startOf('month').startOf('week')
        let ubound = moment(currentDate).endOf('month').endOf('week')
        let dates = [
            `lbound=${encodeURIComponent(lbound.format('YYYY-MM-DD'))}`,
            `ubound=${encodeURIComponent(ubound.format('YYYY-MM-DD'))}`,
        ]
        let categories = ([...selectedCategories].map( (category) =>  `categories=${encodeURIComponent(category)}` ))
        let params = [...dates, ...categories, `fts=${encodeURIComponent(ftsValue)}`]
        fetch(`/api/events?${params.join("&")}`)
          .then(res => res.json())
          .then(data => {
              let events = data.map((event: Event) => {
                  if (!event.frequency) {
                      return event
                  }
                  let eventDate = moment(event.start_at)
                  let lastDate = event.end_at && moment(event.end_at) < ubound ? moment(event.end_at).utc(true) : ubound
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
        <>
            <MessageDialog messageDialog={messageDialogState} setMessageDialog={setMessageDialogState} />
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
                onSelectEvent={(event: Event) => {
                    setMessageDialogState({
                        isOpen: true,
                        status: "neutral",
                        title: event.title,
                        message: <>
                            {moment(event.start_at).format("dddd Do MMMM YYYY")}
                            <br />
                            {event.city}, {event.country}
                            <br />
                            {event.categories && event.categories.map((category, idx) => <span key={`${idx}`} className={`event-tag event-tag-${category}`}>{category}</span>)}
                            <br />
                            {event.url && <a href={event.url} className="text-blue-400 hover:text-blue-500">
                                More <ArrowTopRightOnSquareIcon className="h-3 w-3 inline"/>
                            </a>}
                        </>,
                  })
                }}
                startAccessor="start_at"
                endAccessor="end_at"
                showAllEvents={true}
                style={{ width: "100%" }}
                views={['month']}
            />
        </>
    )
}

export default Calendar
