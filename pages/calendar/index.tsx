import moment from 'moment';
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'

import { EventDetailsSimple } from 'components/EventPreview'
import { GetEvents } from 'lib/calendar'


moment.locale("en", {
    "week": {
        "dow": 1,
        "doy": 1,
    },
})
const localizer = momentLocalizer(moment);

const Calendar: NextPage = () => {
    const [events, setEvents] = useState([])
    useEffect(() => {
        fetch('/api/calendar/events')
          .then(res => res.json())
          .then(data => setEvents(data))
      }, [])
    return (
        <BigCalendar
          components={{
            event: EventDetailsSimple,
          }}
          defaultDate={new Date()}
          defaultView="month"
          events={events.map((event: any, idx: number) => {
              return {
                ...event,
                start_at: moment(event.start_at).format("YYYY-MM-DD"),
                end_at: event.end_at ? moment(event.end_at).format("YYYY-MM-DD") : moment(event.start_at).format("YYYY-MM-DD"),
                allDay: true,
              }
          })}
          localizer={localizer}
          startAccessor="start_at"
          endAccessor="end_at"
          style={{ height: "100vh", width: "100%" }}
          views={['month']}
        />
    )
}

export default Calendar
