import { Badge, Button, Checkbox, Dropdown, Label, TextInput } from "flowbite-react";
import moment from "moment";
import Link from "next/link";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { unstable_getServerSession } from "next-auth/next";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth/core/types";
import { Event, Role } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import Select, { ActionMeta, MultiValue } from "react-select";
import { LEFT, RIGHT, SwipeEventData, useSwipeable } from "react-swipeable";
import { yupResolver } from "@hookform/resolvers/yup";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import { FiZoomIn } from "react-icons/fi";
import { HiArrowTopRightOnSquare, HiCalendar } from "react-icons/hi2";
import { IoLocationOutline } from "react-icons/io5";
import { loadEvents, Toolbar } from "components/CalendarToolbar";
import { EventDetailsSimple } from "components/EventPreview";
import { IModal, Modal } from "components/Modal";
import { IPopup, Popup } from "components/Popup";
import { frequencyIntervals } from "lib/calendar";
import { Subscription } from "lib/prisma";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { categories } from "schemas/event";
import { GetSubscriptions } from "lib/subscription";
import { subscriberSchema } from "schemas/subscriber";

moment.locale("en", {
    week: {
        dow: 1,
        doy: 1,
    },
});
const localizer = momentLocalizer(moment);

interface Props {
    subscriptions: Subscription[];
}

interface IMessageDialog {
    isOpen: boolean;
    status?: string;
    title?: string;
    message?: any;
    content?: any;
    customButtons?: object[];
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    const subscriptions = await GetSubscriptions(undefined, session?.user.roles);

    return {
        props: {
            subscriptions: subscriptions.map((subscription) => ({
                title: subscription.title,
                description: subscription.description,
                slug: subscription.slug,
            })),
        },
    };
};

const Calendar: NextPage<Props> = ({ subscriptions }) => {
    const { data: session, status } = useSession();
    const [calendar, setCalendar] = useState(null);
    const [events, setEvents] = useState([]);
    const [modal, setModal] = useState<IModal>({
        isOpen: false,
    });
    const [popup, setPopup] = useState<IPopup>({ isOpen: false });
    const router = useRouter();

    const calendarRef = useCallback((node) => setCalendar(node), []);

    const handleSwiped = (eventData: SwipeEventData) => {
        const selectors = Object.fromEntries([
            [RIGHT, "data-previous-month"],
            [LEFT, "data-next-month"],
        ]);
        if (Object.hasOwn(selectors, eventData.dir)) {
            const click = new MouseEvent("click", {
                view: window,
                bubbles: true,
                cancelable: true,
            });
            const selector = selectors[eventData.dir];
            const button = document.querySelector(`[${selector}]`) as HTMLInputElement;
            button.dispatchEvent(click);
        }
    };

    const swipeHandlers = useSwipeable({
        onSwiped: handleSwiped,
    });

    return (
        <>
            <Modal modal={modal} setModal={setModal} />
            <Popup popup={popup} setPopup={setPopup} />
            <div {...swipeHandlers} style={{ width: "100%" }}>
                {calendar && (
                    <Toolbar
                        calendar={calendar}
                        setEvents={setEvents}
                        subscriptions={subscriptions}
                    />
                )}
                <BigCalendar
                    ref={calendarRef}
                    components={{
                        event: EventDetailsSimple,
                    }}
                    toolbar={false}
                    defaultDate={new Date()}
                    defaultView="month"
                    events={events.map((event: any, idx: number) => {
                        return {
                            ...event,
                            start_at: moment(event.start_at),
                            end_at: moment(event.end_at || event.start_at).endOf("day"),
                            allDay: true,
                        };
                    })}
                    localizer={localizer}
                    onSelectEvent={(event: Event) => {
                        const defaultImgClasses = ["h-48", "justify-self-center"];
                        let state: IModal = {
                            isOpen: true,
                            status: "neutral",
                            title: event.title,
                            message: (
                                <div className="flex items-center justify-around gap-2">
                                    {event.imageDataUrl && (
                                        <div
                                            className="relative basis-1/2 hover:cursor-zoom-in grid bg-slate-300 dark:bg-gray-600 rounded-lg overflow-hidden"
                                            onClick={(e) => {
                                                const zoomImgClasses = [
                                                    "fixed",
                                                    "left-0",
                                                    "top-0",
                                                    "w-screen",
                                                    "h-screen",
                                                    "bg-black",
                                                    "hover:cursor-zoom-out",
                                                ];
                                                const img = document.getElementById(`event-img-${event.id}`)!;
                                                const classes = img.classList;
                                                if (img.dataset.isZoomed === "yes") {
                                                    classes.remove(...zoomImgClasses);
                                                    classes.add(...defaultImgClasses);
                                                    img.dataset.isZoomed = "no";
                                                } else {
                                                    classes.remove(...defaultImgClasses);
                                                    classes.add(...zoomImgClasses);
                                                    img.dataset.isZoomed = "yes";
                                                }
                                            }}
                                            onKeyPress={(e) => {
                                                const zoomImgClasses = [
                                                    "fixed",
                                                    "left-0",
                                                    "top-0",
                                                    "w-screen",
                                                    "h-screen",
                                                    "bg-black",
                                                    "hover:cursor-zoom-out",
                                                ];
                                                const img = document.getElementById(`event-img-${event.id}`)!;
                                                const classes = img.classList;
                                                if (img.dataset.isZoomed === "yes") {
                                                    classes.remove(...zoomImgClasses);
                                                    classes.add(...defaultImgClasses);
                                                    img.dataset.isZoomed = "no";
                                                } else {
                                                    classes.remove(...defaultImgClasses);
                                                    classes.add(...zoomImgClasses);
                                                    img.dataset.isZoomed = "yes";
                                                }
                                            }}
                                        >
                                            <img
                                                id={`event-img-${event.id}`}
                                                src={event.imageDataUrl}
                                                alt={event.title}
                                                className={`object-contain ${defaultImgClasses.join(" ")}`}
                                                data-is-zoomed="no"
                                            />
                                            <FiZoomIn className="h-7 w-7 text-white opacity-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                        </div>
                                    )}
                                    <div className="basis-1/2 grow flex flex-col gap-1 text-sm md:text-base text-black dark:text-white">
                                        <div className="flex gap-1 items-center">
                                            <HiCalendar className="h-5 w-5 text-purple-700 dark:text-white" />
                                            <div>{moment(event.start_at).format("MMM Do, YYYY")}</div>
                                        </div>
                                        <div className="flex gap-1 items-center">
                                            <IoLocationOutline className="h-5 w-5 text-purple-700 dark:text-white" />
                                            <div>
                                                {event.city}, {event.country}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {event.categories?.map((category, idx) => (
                                                <Badge key={`${idx}`} color={category}>
                                                    {category}
                                                </Badge>
                                            ))}
                                        </div>
                                        {event.url && (
                                            <a
                                                href={event.url}
                                                className="text-blue-400 hover:text-blue-500"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                More <HiArrowTopRightOnSquare className="h-3 w-3 inline" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ),
                        };
                        if (session?.user.roles.includes(Role.contributor)) {
                            const endpoint = `/api/events/${event.id}`;
                            const _fetch = (method: string, endpoint: string, data: any) => {
                                const options = {
                                    method: method,
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: data ? JSON.stringify(data) : null,
                                };
                                return fetch(endpoint, options)
                                    .then((response) => {
                                        if (!response.ok) {
                                            throw new Error("An error occured, please try again later.");
                                        }
                                        return response.json();
                                    })
                                    .then((data) => {
                                        loadEvents();
                                        setModal({ isOpen: false });
                                    })
                                    .catch((error) => {
                                        setModal({
                                            isOpen: true,
                                            status: "error",
                                            title: "Error",
                                            message: error.message,
                                        });
                                    });
                            };
                            const eventHandler = (message: string, callback: Function) => {
                                return () =>
                                    setPopup({
                                        isOpen: true,
                                        message: message,
                                        buttons: [
                                            {
                                                title: "Yes",
                                                callback: callback,
                                                color: "purple",
                                            },
                                            {
                                                title: "No",
                                                color: "light",
                                            },
                                        ],
                                    });
                            };
                            state["customButtons"] = [
                                {
                                    callback: () => router.push(`/calendar/form?eventId=${event.id}`),
                                    color: "purple",
                                    title: "Edit",
                                },
                            ];
                            if (event.frequency) {
                                state["customButtons"].push({
                                    custom: (
                                        <Dropdown label="Delete" color="failure" size="sm">
                                            <Dropdown.Item
                                                onClick={eventHandler(
                                                    "Doing this will delete ALL occurences to the event, it CAN'T be reverted. Are you sure?",
                                                    () => _fetch("DELETE", endpoint, null),
                                                )}
                                            >
                                                All events
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={eventHandler(
                                                    "Doing this will remove the selected event. Are you sure?",
                                                    () => {
                                                        const data = {
                                                            excluded_on: (event.excluded_on || []).concat([
                                                                moment(event.start_at).toDate(),
                                                            ]),
                                                        };
                                                        const result = _fetch("PATCH", endpoint, data);
                                                    },
                                                )}
                                            >
                                                Ony this one
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={eventHandler(
                                                    "Doing this will remove the selected and ALL of the following events. Are you sure?",
                                                    () => {
                                                        const endAt = moment(event.end_at);
                                                        endAt.subtract(frequencyIntervals[event.frequency!]);
                                                        const data = {
                                                            end_at: endAt.toDate(),
                                                        };
                                                        const result = _fetch("PATCH", endpoint, data);
                                                    },
                                                )}
                                            >
                                                This one and the followings
                                            </Dropdown.Item>
                                        </Dropdown>
                                    ),
                                });
                            } else {
                                state["customButtons"].push({
                                    callback: eventHandler(
                                        "Doing this will delete the event, it CAN'T be reverted. Are you sure?",
                                        () => _fetch("DELETE", endpoint, null),
                                    ),
                                    color: "failure",
                                    title: "Delete",
                                });
                            }
                        }
                        setModal(state);
                    }}
                    startAccessor="start_at"
                    endAccessor="end_at"
                    showAllEvents={true}
                    views={["month"]}
                />
            </div>
        </>
    );
};

export default Calendar;
