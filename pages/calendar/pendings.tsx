import { ArrowSmRightIcon } from '@heroicons/react/outline'
import moment from 'moment';
import type { NextPage } from 'next'
import { useSession, signIn } from "next-auth/react"
import { Event, Role } from '@prisma/client';
import { useEffect, useState } from 'react'

import { MessageDialog } from 'components/MessageDialog'
import { GetPendingEvents } from 'lib/calendar'


interface Props {
    events: any
}


export const getStaticProps = async () => {
  const events: Event[] = await GetPendingEvents();

  return {
    props: {
      events: events.map((event) => ({
          id: event.id,
          title: event.title,
          url: event.url,
          location: `${event.city}, ${event.country}`,
          start_at: moment(event.start_at).format("YYYY-MM-DD"),
          end_at: event.end_at ? moment(event.end_at).format("YYYY-MM-DD") : null,
          categories: event.categories,
      })),
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every second
    revalidate: 60, // In seconds
  };
};


const Pendings: NextPage<Props> = ({ events }) => {
    const { data: session, status } = useSession({required: true})
    const [ messageDialogState, setMessageDialogState ] = useState({
        isOpen: false,
        status: "",
        title: "",
        message: "",
    });
    if (status === "loading") {
        return <>Loading</>
    }
    const statuteEvent = (e: any) => {
        const button = e.target
        const validation_status = {
            "reject": "rejected",
            "validate": "validated",
        }[button.dataset.eventAction as string]
        let eventIds = []
        if (button.dataset.eventAll) {
            const elements = document.querySelectorAll('[data-event-id]') as NodeListOf<HTMLElement>;
            eventIds = [...elements].map((element: HTMLElement) => element.dataset.eventId)
        }
        else {
            eventIds = [button.dataset.eventId]
        }
        const requests = eventIds.map((eventId) => {
            const endpoint = `/api/events/${eventId}`
            const JSONdata = JSON.stringify({"validation_status": validation_status})

            const options = {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSONdata,
            }
            return fetch(endpoint, options)
        });
        Promise.all(requests)
            .then((responses) => {
                const errors = responses.filter((response) => !response.ok);
                if (errors.length > 0) {
                    throw errors.map((response) => Error(response.statusText));
                }
                const json = responses.map((response) => response.json());
                return Promise.all(json);
            })
            .then((data) => {
                data.forEach((datum) => {
                    const element = document.querySelector(`[data-row-event-id="${datum.eventId}"]`) as HTMLElement;
                    if (element) {
                        element.remove()
                    }
                });
                setMessageDialogState({
                    isOpen: true,
                    status: "success",
                    title: "Success!",
                    message: "",
                })
            })
            .catch((errors) => {
                if (!errors) {
                    return
                }
                setMessageDialogState({
                    isOpen: true,
                    status: "error",
                    title: "Fail!",
                    message: "",
                })
            })
  }

  return (
      <>
        <h1 className="text-xl md:text-6xl font-bold py-4 text-center">Pendings</h1>

        <MessageDialog messageDialog={messageDialogState} setMessageDialog={setMessageDialogState} />

        <table className="w-full table-fixed">
            <thead>
                <tr>
                    <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-left">Title</th>
                    <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-left">Date</th>
                    <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-left">Categories</th>
                    <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-left">Location</th>
                    <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-left">Url</th>
                    <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-left flex gap-x-px">
                        <button type="button" className="basis-1/2 btn btn-emerald" onClick={statuteEvent} data-event-action="validate" data-event-all>Validate all</button>
                        <button type="button" className="basis-1/2 btn btn-red" onClick={statuteEvent} data-event-action="reject" data-event-all>Reject all</button>
                    </th>
                </tr>
            </thead>
            <tbody>
                {events.map((event: any, idx: number) => (
                    <tr key={event.id} data-row-event-id={event.id}>
                        <td className="border-b border-slate-100 p-4 pl-8">{event.title}</td>
                        <td className="border-b border-slate-100 p-4 pl-8">
                            {event.start_at} 
                            {event.end_at && <ArrowSmRightIcon className="h-5 w-5 -mt-1 inline"/>}
                            {event.end_at} 
                        </td>
                        <td className="border-b border-slate-100 p-4 pl-8">
                            {event.categories.map((category: any, idx: number) => (
                              <span key={idx} className={`event-tag-${category} px-2 rounded lowercase text-sm mr-1 md:text-base`}>{category}</span>
                            ))}
                        </td>
                        <td className="border-b border-slate-100 p-4 pl-8">{event.location}</td>
                        <td className="border-b border-slate-100 p-4 pl-8"><a href={event.url}>{event.url}</a></td>
                        <td className="border-b border-slate-100 p-4 pl-8 flex gap-x-px">
                            <button type="button" className="basis-1/2 btn btn-emerald" onClick={statuteEvent} data-event-action="validate" data-event-id={event.id}>Validate</button>
                            <button type="button" className="basis-1/2 btn btn-red" onClick={statuteEvent} data-event-action="reject" data-event-id={event.id}>Reject</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </>
  )
}

export default Pendings
