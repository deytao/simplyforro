import moment from "moment";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth/core/types";
import { Event, Role } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LEFT, RIGHT, SwipeEventData, useSwipeable } from "react-swipeable";
import { yupResolver } from "@hookform/resolvers/yup";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import {
    ArrowTopRightOnSquareIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    RssIcon,
} from "@heroicons/react/24/outline";

import { EventDetailsSimple } from "components/EventPreview";
import { MessageDialog } from "components/MessageDialog";
import { frequencyIntervals } from "lib/calendar";
import { Subscription } from "lib/prisma";
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

export const getStaticProps = async () => {
    const subscriptions = await GetSubscriptions();

    return {
        props: {
            subscriptions: subscriptions.map((subscription) => ({
                title: subscription.title,
                description: subscription.description,
                slug: subscription.slug,
            })),
        },
        // Next.js will attempt to re-generate the page:
        // - When a request comes in
        // - At most once every second
        revalidate: 3600, // In seconds
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
            <div className="sticky top-[68px] md:top-[82px] lg:top-[86px] z-40 bg-white">
                <div className="grid grid-cols-4">
                    <button
                        type="button"
                        onClick={prevMonth}
                        onKeyPress={prevMonth}
                        className="col-span-1 grid place-items-center lg:hidden"
                        data-previous-month={true}
                    >
                        <ChevronLeftIcon className="h-8 w-8" />
                    </button>
                    <h1 className="col-span-2 lg:col-span-4 text-xl md:text-4xl font-bold py-4 text-center">{label}</h1>
                    <button
                        type="button"
                        onClick={nextMonth}
                        onKeyPress={nextMonth}
                        className="col-span-1 grid place-items-center lg:hidden"
                        data-next-month={true}
                    >
                        <ChevronRightIcon className="h-8 w-8" />
                    </button>
                </div>
                <div className="relative grid grid-cols-7 gap-x-4 gap-y-1 mb-2">
                    <div className="col-span-3 md:col-span-2 lg:col-span-1 flex items-center order-1">
                        <button
                            type="button"
                            onClick={prevMonth}
                            onKeyPress={prevMonth}
                            className="hidden lg:block"
                            data-previous-month={true}
                        >
                            <ChevronLeftIcon className="h-3 md:h-6 w-6 md:w-12" />
                        </button>
                        <button
                            type="button"
                            onClick={currentMonth}
                            onKeyPress={currentMonth}
                            className="btn btn-neutral ml-2 lg:ml-0"
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={nextMonth}
                            onKeyPress={nextMonth}
                            className="hidden lg:block"
                            data-next-month={true}
                        >
                            <ChevronRightIcon className="h-3 md:h-6 w-6 md:w-12" />
                        </button>
                    </div>
                    <div className="col-span-4 lg:col-span-2 flex justify-center order-2">
                        <input
                            type="text"
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
                                    <input
                                        type="checkbox"
                                        id={`categories-${category}`}
                                        value={category}
                                        onChange={changeCategories}
                                        data-filters-categories={true}
                                        checked={selectedCategories.includes(category)}
                                    />
                                    <label
                                        htmlFor={`categories-${category}`}
                                        className={`event-tag-${category} px-2 rounded capitalize text-sm md:text-base`}
                                    >
                                        {category}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-start-6 md:col-end-8 col-span-2 md:col-span-1 order-4 pr-2 flex items-center justify-end gap-1">
                        <button className="btn btn-neutral" onClick={showForm} onKeyPress={showForm}>
                            {status !== "authenticated" && <span className="hidden lg:inline">Subscribe</span>}
                            {status === "authenticated" && <span className="hidden lg:inline">My Subscriptions</span>}
                            <RssIcon className="h-4 w-6 lg:hidden" />
                        </button>
                        <Link href="/calendar/form" className="btn btn-violet">
                            <span className="hidden lg:inline">Add</span>
                            <PlusIcon className="h-4 w-6 lg:hidden" />
                        </Link>
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
    const [messageDialogState, setMessageDialogState] = useState<IMessageDialog>({
        isOpen: false,
    });
    const formOptions = {
        resolver: yupResolver(subscriberSchema),
        defaultValues: {
            name: session?.user.name,
            email: session?.user.email,
            subscriptions: session?.user.subscriptions?.map((subscription) => subscription.slug),
        },
    };
    const { register, handleSubmit, reset, formState, watch } = useForm(formOptions);
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
                setMessageDialogState({
                    isOpen: true,
                    status: "success",
                    title: "Subscriptions updated!",
                    message: "Your subscriptions settings have updated.",
                });
            })
            .catch((error) => {
                setMessageDialogState({
                    isOpen: true,
                    status: "error",
                    title: "Error",
                    message: error.message,
                });
            });
        return false;
    }

    const reloadFailSubmit = (errors: Object) => {
        setMessageDialogState({ isOpen: false });
        showForm(errors);
    };

    const showForm = (errors: any = {}) => {
        setMessageDialogState({
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
                                        <input
                                            type="text"
                                            {...register("name")}
                                            placeholder="John Doe"
                                            className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded sm:text-sm border-gray-300"
                                        />
                                    </div>
                                    <div className="text-red-500 text-xs italic">{errors.name?.message}</div>
                                </div>

                                <div className="col-span-1">
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input
                                            type="text"
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
                                <input type="hidden" {...register("name")} />
                                <input type="hidden" {...register("email")} />
                            </>
                        )}
                        <div className="col-span-2">
                            <fieldset className="mt-2">
                                <legend className="text-base font-medium text-gray-900">Subscriptions</legend>
                                <p className="text-red-500 text-xs italic">{errors.subscriptions?.message}</p>
                                <div className="mt-2 space-y-4">
                                    {subscriptions.map((subscription: Subscription) => (
                                        <div key={subscription.slug} className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    id={`subscriptions-${subscription.slug}`}
                                                    {...register("subscriptions")}
                                                    value={subscription.slug}
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label
                                                    htmlFor={`subscriptions-${subscription.slug}`}
                                                    className="font-medium text-gray-700"
                                                >
                                                    {subscription.title}
                                                    <p className="text-gray-500 font-normal">
                                                        {subscription.description}
                                                    </p>
                                                </label>
                                            </div>
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
                    classes: "btn btn-emerald",
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
                        while (eventDate <= lastDate) {
                            if (eventDate >= lbound) {
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
            <MessageDialog messageDialog={messageDialogState} setMessageDialog={setMessageDialogState} />
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
                        let state: IMessageDialog = {
                            isOpen: true,
                            status: "neutral",
                            title: event.title,
                            message: (
                                <>
                                    {moment(event.start_at).format("dddd Do MMMM YYYY")}
                                    <br />
                                    {event.city}, {event.country}
                                    <br />
                                    {event.categories?.map((category, idx) => (
                                        <span key={`${idx}`} className={`event-tag event-tag-${category}`}>
                                            {category}
                                        </span>
                                    ))}
                                    <br />
                                    {event.url && (
                                        <a
                                            href={event.url}
                                            className="text-blue-400 hover:text-blue-500"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            More <ArrowTopRightOnSquareIcon className="h-3 w-3 inline" />
                                        </a>
                                    )}
                                </>
                            ),
                        };
                        if (session?.user.roles.includes(Role.contributor)) {
                            state["customButtons"] = [
                                {
                                    callback: () => router.push(`/calendar/form?eventId=${event.id}`),
                                    classes: "btn btn-violet",
                                    title: "Edit",
                                },
                                {
                                    callback: () => {
                                        if (confirm("Sure?")) {
                                            const endpoint = `/api/events/${event.id}`;

                                            const options = {
                                                method: "DELETE",
                                            };
                                            const result = fetch(endpoint, options)
                                                .then((response) => {
                                                    if (!response.ok) {
                                                        throw new Error("An error occured, please try again later.");
                                                    }
                                                    return response.json();
                                                })
                                                .then((data) => {
                                                    loadEvents();
                                                    setMessageDialogState({ isOpen: false });
                                                })
                                                .catch((error) => {
                                                    setMessageDialogState({
                                                        isOpen: true,
                                                        status: "error",
                                                        title: "Error",
                                                        message: error.message,
                                                    });
                                                });
                                        }
                                    },
                                    classes: "btn btn-red",
                                    title: "Delete",
                                },
                            ];
                        }
                        setMessageDialogState(state);
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
