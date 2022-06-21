import moment from 'moment';
import type { NextPage } from 'next'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'

import { EventDetailsSimple } from 'components/EventPreview'
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
            end_at: event.end_at ? moment(event.end_at).format("YYYY-MM-DD") : moment(event.start_at).format("YYYY-MM-DD"),
            allDay: true,
          }
      }),
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every second
    revalidate: 600, // In seconds
  };
};

moment.locale("en", {
    "week": {
        "dow": 1,
        "doy": 1,
    },
})
const localizer = momentLocalizer(moment);

const Calendar: NextPage<Props> = ({ staticEvents }) => {
    return (
        <BigCalendar
          components={{
            event: EventDetailsSimple,
          }}
          defaultDate={new Date()}
          defaultView="month"
          events={staticEvents}
          localizer={localizer}
          startAccessor="start_at"
          endAccessor="end_at"
          style={{ height: "100vh", width: "100%" }}
          views={['month']}
        />
    )
}

export default Calendar
