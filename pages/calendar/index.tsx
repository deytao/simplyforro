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
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState([])
    useEffect(() => {
        let lbound = moment(currentDate).startOf('month').startOf('week').format('YYYY-MM-DD')
        let ubound = moment(currentDate).endOf('month').endOf('week').format('YYYY-MM-DD')
        fetch(`/api/calendar/events?lbound=${encodeURIComponent(lbound)}&ubound=${encodeURIComponent(ubound)}`)
          .then(res => res.json())
          .then(data => setEvents(data))
      }, [currentDate])

    return (
        <BigCalendar
          components={{
            event: EventDetailsSimple,
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
