import { Badge, Button, Checkbox, Dropdown, Label, TextInput } from "flowbite-react";
import moment from "moment";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { unstable_getServerSession } from "next-auth/next";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth/core/types";
import { Event, Role } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LEFT, RIGHT, SwipeEventData, useSwipeable } from "react-swipeable";
import { yupResolver } from "@hookform/resolvers/yup";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import { HiArrowTopRightOnSquare, HiChevronLeft, HiChevronRight, HiPlus, HiRss } from "react-icons/hi2";

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

const Toolbar = ({
    label,
    onNavigate,
    selectedCategories,
    ftsValue,
    showForm,
    status,
}: {
    label: string;
    onNavigate: any;
    selectedCategories: string[];
    ftsValue: string;
    showForm: any;
    status: string;
}) => {
    const prevMonth = () => onNavigate("PREV");
    const currentMonth = () => onNavigate("TODAY");
    const nextMonth = () => onNavigate("NEXT");
    const changeCategories = () => onNavigate();
    let taskId: ReturnType<typeof setTimeout>;
    const changeFTS = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (taskId) {
            clearTimeout(taskId);
        }
        taskId = setTimeout(() => onNavigate(), 800);
    };
    return (
        <>
            <div className="sticky top-[72px] md:top-[88px] lg:top-[88px] z-40 bg-white dark:bg-gray-800">
                <div className="flex items-center">
                    <Button
                        color=""
                        size="sm"
                        className="lg:hidden basis-1/4"
                        onClick={prevMonth}
                        onKeyPress={prevMonth}
                        data-previous-month={true}
                    >
                        <HiChevronLeft className="h-8 w-8" />
                    </Button>
                    <h1 className="basis-1/2 lg:grow text-xl md:text-4xl font-bold py-4 text-center">{label}</h1>
                    <Button
                        color=""
                        size="sm"
                        className="lg:hidden basis-1/4"
                        onClick={nextMonth}
                        onKeyPress={nextMonth}
                        data-next-month={true}
                    >
                        <HiChevronRight className="h-8 w-8" />
                    </Button>
                </div>
                <div className="relative grid grid-cols-7 gap-x-4 gap-y-1 mb-2">
                    <div className="col-span-3 md:col-span-2 lg:col-span-1 flex items-center order-1">
                        <Button
                            color=""
                            size="sm"
                            onClick={prevMonth}
                            onKeyPress={prevMonth}
                            className="hidden lg:block"
                            data-previous-month={true}
                        >
                            <HiChevronLeft className="h-3 md:h-6 w-6 md:w-12" />
                        </Button>
                        <Button color="purple" size="sm" onClick={currentMonth} onKeyPress={currentMonth}>
                            Today
                        </Button>
                        <Button
                            color=""
                            size="sm"
                            onClick={nextMonth}
                            onKeyPress={nextMonth}
                            className="hidden lg:block"
                            data-next-month={true}
                        >
                            <HiChevronRight className="h-3 md:h-6 w-6 md:w-12" />
                        </Button>
                    </div>
                    <div className="col-span-4 lg:col-span-2 flex justify-center order-2">
                        <TextInput
                            key="fts-field"
                            onChange={changeFTS}
                            placeholder="Search..."
                            defaultValue={ftsValue}
                            data-filters-fts={true}
                        />
                    </div>
                    <div className="col-span-5 lg:col-span-3 order-3 p-1">
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            {categories.map((category: any, idx: number) => (
                                <div key={idx} className="flex items-center basis-1/6">
                                    <Checkbox
                                        id={`categories-${category}`}
                                        value={category}
                                        onChange={changeCategories}
                                        checked={selectedCategories.includes(category)}
                                        data-filters-categories={true}
                                    />
                                    <Label htmlFor={`categories-${category}`} className="capitalize">
                                        <Badge color={category}>
                                            {category}
                                        </Badge>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-start-6 md:col-end-8 col-span-2 md:col-span-1 order-4 flex items-center justify-end gap-1">
                        <Button color="purple" size="xs" onClick={showForm} onKeyPress={showForm}>
                            <HiRss className="h-4 w-6" />
                        </Button>
                        <Button color="purple" size="xs" href="/calendar/form">
                            <HiPlus className="h-4 w-6" />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

const Calendar: NextPage<Props> = ({ subscriptions }) => {
    const { data: session, status } = useSession();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedCategories, setSelectedCategories] = useState(categories);
    const [ftsValue, setFTSValue] = useState("");
    const [events, setEvents] = useState([]);
    const [modal, setModal] = useState<IModal>({
        isOpen: false,
    });
    const [popup, setPopup] = useState<IPopup>({ isOpen: false });
    const { register, handleSubmit, formState } = useForm({ resolver: yupResolver(subscriberSchema) });
    const { errors } = formState;
    const router = useRouter();

    async function submitForm(formData: object) {
        const endpoint = "/api/subscribers";
        const subscriber = subscriberSchema.cast(formData);
        const JSONdata = JSON.stringify(subscriber);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSONdata,
        };
        await fetch(endpoint, options)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("An error occured, please try again later.");
                }
                return response.json();
            })
            .then((data) => {
                setModal({
                    isOpen: true,
                    status: "success",
                    title: "Subscriptions updated!",
                    message: "Your subscriptions settings have updated.",
                });
            })
            .catch((error) => {
                setModal({
                    isOpen: true,
                    status: "error",
                    title: "Error",
                    message: error.message,
                });
            });
        return false;
    }

    const reloadFailSubmit = (errors: Object) => {
        setModal({ isOpen: false });
        showForm(errors);
    };

    const showForm = (errors: any = {}) => {
        const userSubscriptionSlugs = session?.user.subscriptions?.map((subscription) => subscription.slug);
        setModal({
            isOpen: true,
            status: "neutral",
            title: "Configuration",
            content: (
                <>
                    <div className="grid grid-cols-2 gap-1">
                        {!session && (
                            <>
                                <div className="col-span-1">
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <TextInput
                                            {...register("name")}
                                            placeholder="John Doe"
                                            className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded sm:text-sm border-gray-300"
                                        />
                                    </div>
                                    <div className="text-red-500 text-xs italic">{errors.name?.message}</div>
                                </div>

                                <div className="col-span-1">
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <TextInput
                                            {...register("email")}
                                            placeholder="john.doe@email.com"
                                            className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded sm:text-sm border-gray-300"
                                        />
                                    </div>
                                    <div className="text-red-500 text-xs italic">{errors.email?.message}</div>
                                </div>
                            </>
                        )}
                        {session && (
                            <>
                                <input type="hidden" {...register("name", { value: session?.user.name })} />
                                <input type="hidden" {...register("email", { value: session?.user.email })} />
                            </>
                        )}
                        <div className="col-span-2">
                            <fieldset className="mt-2">
                                <legend className="text-base font-medium text-gray-900 dark:text-white">Subscriptions</legend>
                                <p className="text-red-500 text-xs italic">{errors.subscriptions?.message}</p>
                                <div className="mt-2 space-y-4">
                                    {subscriptions.map((subscription: Subscription) => (
                                        <div key={subscription.slug} className="flex items-start gap-2">
                                            <div className="flex items-center h-5">
                                                <Checkbox
                                                    id={`subscriptions-${subscription.slug}`}
                                                    {...register("subscriptions")}
                                                    value={subscription.slug}
                                                    defaultChecked={userSubscriptionSlugs?.includes(subscription.slug)}
                                                />
                                            </div>
                                            <Label htmlFor={`subscriptions-${subscription.slug}`}>
                                                {subscription.title}
                                                <p className="text-gray-500 dark:text-gray-300">
                                                    {subscription.description}
                                                </p>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </fieldset>
                        </div>
                    </div>
                </>
            ),
            customButtons: [
                {
                    callback: (e: React.MouseEvent<HTMLElement>) => handleSubmit(submitForm, reloadFailSubmit)(e),
                    color: "success",
                    title: "Submit",
                },
            ],
        });
    };

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

    const loadEvents = () => {
        let lbound = moment(currentDate).startOf("month").startOf("week");
        let ubound = moment(currentDate).endOf("month").endOf("week");
        let dates = [
            `lbound=${encodeURIComponent(lbound.format("YYYY-MM-DD"))}`,
            `ubound=${encodeURIComponent(ubound.format("YYYY-MM-DD"))}`,
        ];
        let categories = [...selectedCategories].map((category) => `categories=${encodeURIComponent(category)}`);
        let params = [...dates, ...categories, `q=${encodeURIComponent(ftsValue)}`];
        fetch(`/api/events?${params.join("&")}`)
            .then((res) => res.json())
            .then((data) => {
                let events = data
                    .map((event: Event) => {
                        if (!event.frequency) {
                            return event;
                        }
                        let eventDate = moment(event.start_at);
                        let lastDate =
                            event.end_at && moment(event.end_at) < ubound ? moment(event.end_at).utc(true) : ubound;
                        let events: Event[] = [];
                        while (eventDate.isSameOrBefore(lastDate)) {
                            let isExcluded = event.excluded_on?.filter((excluded_date) => {
                                return moment(excluded_date).format("YYYY-MM-DD") === eventDate.format("YYYY-MM-DD");
                            });
                            if (eventDate.isSameOrAfter(lbound) && !isExcluded?.length) {
                                events.push({
                                    ...event,
                                    start_at: eventDate.toDate(),
                                    end_at: eventDate.toDate(),
                                });
                            }
                            eventDate.add(frequencyIntervals[event.frequency]);
                        }
                        return events;
                    })
                    .flat(1);
                setEvents(events);
            });
    };

    useEffect(loadEvents, [currentDate, selectedCategories, ftsValue]);

    return (
        <>
            <Modal modal={modal} setModal={setModal} />
            <Popup popup={popup} setPopup={setPopup} />
            <div {...swipeHandlers} style={{ width: "100%" }}>
                <BigCalendar
                    components={{
                        event: EventDetailsSimple,
                        toolbar: (args) => Toolbar({ ...args, selectedCategories, ftsValue, showForm, status }),
                    }}
                    defaultDate={currentDate}
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
                    onNavigate={(newDate) => {
                        const elements = document.querySelectorAll(
                            "[data-filters-categories]:checked",
                        ) as NodeListOf<HTMLInputElement>;
                        const newCategories = [...elements].map((el) => el.value);
                        const ftsInput = document.querySelector("[data-filters-fts]") as HTMLInputElement;

                        if (selectedCategories.length !== newCategories.length) {
                            // useState doesn't check the values themselves but the signature of the array
                            // which is different everytime
                            setSelectedCategories(newCategories);
                        }
                        setFTSValue(ftsInput ? ftsInput.value : "");
                        setCurrentDate(newDate);
                    }}
                    onSelectEvent={(event: Event) => {
                        let state: IModal = {
                            isOpen: true,
                            status: "neutral",
                            title: event.title,
                            message: (
                                <div className="text-black dark:text-white">
                                    {moment(event.start_at).format("dddd Do MMMM YYYY")}
                                    <br />
                                    {event.city}, {event.country}
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
