import moment from 'moment';
import { useState } from 'react'


const categoryClasses = {
    "party": "text-red-900 bg-red-100",
    "pratica": "text-blue-900 bg-blue-100",
    "class": "text-purple-900 bg-purple-100",
    "workshop": "text-orange-900 bg-orange-100",
    "festival": "text-green-900 bg-green-100",
}

export const EventDetails = ({event}) => (
  <div className="shadow border rounded-md p-2 text-left m-1">
    <div className="text-sm font-bold">{event.title}</div>
    <div className="text-sm">{event.city}, {event.country}</div>
    {event.categories && event.categories.map((category, idx) => <span key={`${idx}`} className={`text-xs inline-block px-2 mr-1 lowercase rounded ${categoryClasses[category]}`}>{category}</span>)}
  </div>
)


export const EventPreview = ({eventData}) => {
  let start_at = moment(eventData.start_at)
  let end_at = moment(eventData.end_at)
  return (
    <>
      {/* UNIQUE */}
      {(start_at == end_at || !end_at.isValid()) && 
        <div className="w-1/3 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
          <span className="text-sm inline-block w-full">{start_at.format("DD MMM")}</span>
          <EventDetails event={eventData} />
        </div>}

      {/* REPEAT */}
      {start_at.isBefore(end_at) && eventData.frequency && 
        <div className="flex gap-1 md:gap-2 w-11/12 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
          <div className="w-1/3">
            <span className="text-sm inline-block w-full text-right">{start_at.format("DD MMM")}</span>
            <EventDetails event={eventData} />
          </div>
          <div className="w-1/3">
            <span className="text-sm inline-block w-full text-right">...</span>
            <EventDetails event={eventData} />
          </div>
          <div className="w-1/3">
            <span className="text-sm inline-block w-full text-right">{end_at.format("DD MMM")}</span>
            <EventDetails event={eventData} />
          </div>
        </div>}

      {/* RANGE */}
      {start_at.isBefore(end_at) && !eventData.frequency && 
        <div className="w-11/12 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
          <span className="text-sm inline-block w-1/3 text-right pr-2">{start_at.format("DD MMM")}</span>
          <span className="text-sm inline-block w-1/3 text-right pr-2">...</span>
          <span className="text-sm inline-block w-1/3 text-right pr-2">{end_at.format("DD MMM")}</span>
            <EventDetails event={eventData} />
        </div>}

    </>
  )
}
