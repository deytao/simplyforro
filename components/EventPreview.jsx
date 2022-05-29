import moment from 'moment';
import { useState } from 'react'


const tagClasses = {
    "party": "text-red-900 bg-red-100",
    "pratica": "text-blue-900 bg-blue-100",
    "class": "text-purple-900 bg-purple-100",
    "workshop": "text-orange-900 bg-orange-100",
    "festival": "text-green-900 bg-green-100",
}


export const EventPreview = ({eventData}) => {
  let startDate = moment(eventData.startDate)
  let endDate = moment(eventData.endDate)
  return (
    <div className="md:col-span-2">
      <h2 className="text-2xl font-bold py-4">Preview</h2>

      {/* UNIQUE */}
      {(startDate == endDate || !endDate.isValid()) && 
        <div className="flex gap-2">
          <div className="w-1/3">
            <span className="text-sm inline-block w-full">{startDate.format("DD MMM")}</span>
            <div className="shadow rounded-md p-2">
              <div className="font-bold">{eventData.title}</div>
              <div className="text-sm">{eventData.city}, {eventData.country}</div>
              {eventData.tags && eventData.tags.map((tag, idx) => <span key={`${idx}`} className={`text-xs inline-block px-2 mr-1 lowercase rounded ${tagClasses[tag]}`}>{tag}</span>)}
            </div>
          </div>
        </div>}

      {/* REPEAT */}
      {startDate.isBefore(endDate) && eventData.frequency && 
        <div className="flex gap-2">
          <div className="shadow rounded-md w-1/3 p-2">
            <span className="text-sm inline-block w-full text-right">{startDate.format("DD MMM")}</span>
            <div className="font-bold">{eventData.title}</div>
            <div>{eventData.city}, {eventData.country}</div>
            {eventData.tags && eventData.tags.map((tag, idx) => <span key={`${idx}`} className={`text-xs inline-block px-2 mr-1 lowercase rounded ${tagClasses[tag]}`}>{tag}</span>)}
          </div>
          <div className="shadow rounded-md w-1/3 p-2">
            <span className="text-sm inline-block w-full text-right">...</span>
            <div className="font-bold">{eventData.title}</div>
            <div>{eventData.city}, {eventData.country}</div>
            {eventData.tags && eventData.tags.map((tag, idx) => <span key={`${idx}`} className={`text-xs inline-block px-2 mr-1 lowercase rounded ${tagClasses[tag]}`}>{tag}</span>)}
          </div>
          <div className="shadow rounded-md w-1/3 p-2">
            <span className="text-sm inline-block w-full text-right">{endDate.format("DD MMM")}</span>
            <div className="font-bold">{eventData.title}</div>
            <div>{eventData.city}, {eventData.country}</div>
            {eventData.tags && eventData.tags.map((tag, idx) => <span key={`${idx}`} className={`text-xs inline-block px-2 mr-1 lowercase rounded ${tagClasses[tag]}`}>{tag}</span>)}
          </div>
        </div>}

      {/* RANGE */}
      {startDate.isBefore(endDate) && !eventData.frequency && 
        <div className="shadow rounded-md w-full p-2">
          <span className="text-sm inline-block w-1/3 text-right pr-2">{startDate.format("DD MMM")}</span>
          <span className="text-sm inline-block w-1/3 text-right pr-2">...</span>
          <span className="text-sm inline-block w-1/3 text-right pr-2">{endDate.format("DD MMM")}</span>
          <div className="font-bold">{eventData.title}</div>
          <div>{eventData.city}, {eventData.country}</div>
          {eventData.tags && eventData.tags.map((tag, idx) => <span key={`${idx}`} className={`text-xs inline-block px-2 mr-1 lowercase rounded ${tagClasses[tag]}`}>{tag}</span>)}
        </div>}

    </div>
  )
}
