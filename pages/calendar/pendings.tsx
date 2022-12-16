import { Badge, Button, Card, Label, Toast } from "flowbite-react";
import moment from "moment";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { useEffect, useState } from "react";
import { HiArrowRight, HiOutlineCheckCircle, HiOutlineXMark } from "react-icons/hi2";
import { Event, Role } from "@prisma/client";

import { GetPendingEvents } from "lib/calendar";
import { authOptions } from "pages/api/auth/[...nextauth]";

interface Props {
    events: any;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session?.user.roles.includes(Role.contributor)) {
        return {
            redirect: {
                destination: "/auth/signin",
                permanent: false,
            },
        };
    }
    const events: Event[] = await GetPendingEvents();

    return {
        props: {
            events: events.map((event) => ({
                id: event.id,
                title: event.title,
                url: event.url,
                imageDataUrl: event.imageDataUrl,
                location: `${event.city}, ${event.country}`,
                start_at: moment(event.start_at).format("Do MMM YYYY"),
                end_at: event.end_at ? moment(event.end_at).format("Do MMM YYYY") : null,
                categories: event.categories,
            })),
        },
    };
};

const Pendings: NextPage<Props> = ({ events }) => {
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const statuteEvent = (e: any) => {
        const button = e.currentTarget;
        const validation_status = {
            reject: "rejected",
            validate: "validated",
        }[button.dataset.eventAction as string];
        let eventIds = [];
        if (button.dataset.eventAll) {
            const elements = document.querySelectorAll("[data-event-id]") as NodeListOf<HTMLElement>;
            eventIds = [...elements].map((element: HTMLElement) => element.dataset.eventId);
        } else {
            eventIds = [button.dataset.eventId];
        }
        const requests = eventIds.map((eventId) => {
            const endpoint = `/api/events/${eventId}`;
            const JSONdata = JSON.stringify({ validation_status: validation_status });

            const options = {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSONdata,
            };
            return fetch(endpoint, options);
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
                        element.remove();
                    }
                });
                setToastMessage("Event updated.");
                setTimeout(() => setToastMessage(null), 2000);
            })
            .catch((errors) => {
                if (!errors) {
                    return;
                }
                setToastMessage("An error occured, please try again later");
                setTimeout(() => setToastMessage(null), 2000);
            });
    };

    return (
        <>
            <Toast duration={100} className={`absolute z-50 top-10 ${toastMessage ? "" : "hidden"}`}>
                <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                    <HiOutlineCheckCircle className="h-5 w-5 -mt-1 inline" />
                </div>
                <div className="ml-3 text-sm font-normal">{toastMessage}</div>
                <Toast.Toggle />
            </Toast>

            <h1 className="text-xl md:text-6xl font-bold py-4 text-center">Pendings</h1>

            <div className="flex flex-wrap justify-center gap-2">
                {events.map((event: any, idx: number) => (
                    <Card key={event.id} imgSrc={event.imageDataUrl} data-row-event-id={event.id} className="w-80">
                        <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            <a href={event.url}>{event.title}</a>
                        </h5>
                        <div className="flex font-normal text-gray-700 dark:text-gray-400">
                            <div>{event.start_at}</div>
                            {event.end_at && (
                                <div>
                                    <HiArrowRight className="h-3 w-3 -mt-1 inline" />
                                </div>
                            )}
                            <div>{event.end_at}</div>
                        </div>
                        <p className="font-normal text-gray-700 dark:text-gray-400">{event.location}</p>
                        <div className="flex gap-2">
                            {event.categories?.map((category: string, idx: number) => (
                                <Badge key={`${idx}`} color={category}>
                                    {category}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                color="success"
                                size="sm"
                                onClick={statuteEvent}
                                onKeyPress={statuteEvent}
                                data-event-action="validate"
                                data-event-id={event.id}
                            >
                                <HiOutlineCheckCircle className="h-5 w-5" />
                            </Button>
                            <Button
                                color="failure"
                                size="sm"
                                onClick={statuteEvent}
                                onKeyPress={statuteEvent}
                                data-event-action="reject"
                                data-event-id={event.id}
                            >
                                <HiOutlineXMark className="h-5 w-5" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </>
    );
};

export default Pendings;
