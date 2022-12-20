import { Badge, Button, Checkbox, Dropdown, Label, TextInput } from "flowbite-react";
import moment from "moment";
import Link from "next/link";
import { Event, Role } from "@prisma/client";
import { useEffect, useState } from "react";
import Select, { ActionMeta, MultiValue } from "react-select";
import { yupResolver } from "@hookform/resolvers/yup";
import { HiChevronLeft, HiChevronRight, HiOutlineEllipsisHorizontal } from "react-icons/hi2";
import { IoLocationOutline } from "react-icons/io5";

import { frequencyIntervals } from "lib/calendar";
import { categories } from "schemas/event";
import { GetSubscriptions } from "lib/subscription";
import { subscriberSchema } from "schemas/subscriber";

interface CategoryOption {
    label: string;
    value: string;
    color: string;
    backgroundColor: string;
}

interface ToolbarProps {
    calendarRef: any;
    showForm: any;
    status: string;
    setEvents: Function;
    session: any;
}

const categoriesStyles: { [key: string]: { color: string; backgroundColor: string } } = {
    party: {
        color: "#7F1D1D",
        backgroundColor: "#FEE2E2",
    },
    pratica: {
        color: "#1E3A8A",
        backgroundColor: "#DBEAFE",
    },
    class: {
        color: "#581C87",
        backgroundColor: "#F3E8FF",
    },
    workshop: {
        color: "#7C2D12",
        backgroundColor: "#FFEDD5",
    },
    festival: {
        color: "#14532D",
        backgroundColor: "#DCFCE7",
    },
};

export const loadEvents = (
    date: moment.Moment,
    selectedCategories: MultiValue<CategoryOption>,
    q: string,
    setEvents: Function,
) => {
    let lbound = moment(date).startOf("month").startOf("week");
    let ubound = moment(date).endOf("month").endOf("week");
    let dates = [
        `lbound=${encodeURIComponent(lbound.format("YYYY-MM-DD"))}`,
        `ubound=${encodeURIComponent(ubound.format("YYYY-MM-DD"))}`,
    ];
    let params = [
        ...dates,
        ...[...selectedCategories].map((category) => `categories=${encodeURIComponent(category.value)}`),
        `q=${encodeURIComponent(q)}`,
    ];
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

export const Toolbar = ({ calendarRef, showForm, status, setEvents, session }: ToolbarProps) => {
    if (!calendarRef.current) {
        return <></>;
    }
    const calendar = calendarRef.current;
    const [currentDate, setCurrentDate] = useState(moment(calendar.props.date));
    const changeCategories = () => calendar.handleNavigate();
    let taskId: ReturnType<typeof setTimeout>;
    const changeDate = (e: any) => {
        const actions: { [key: string]: [string, Function] } = {
            previous: ["PREV", (date: moment.Moment) => moment(date).subtract(1, "month")],
            current: ["TODAY", (date: moment.Moment) => moment()],
            next: ["NEXT", (date: moment.Moment) => moment(date).add(1, "month")],
        };
        const monthDirection = e.currentTarget.dataset.month;
        const [calendarAction, modifier] = actions[monthDirection];
        setCurrentDate(modifier(currentDate));
        calendar.handleNavigate(calendarAction);
    };
    const changeFTS = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (taskId) {
            clearTimeout(taskId);
        }
        taskId = setTimeout(() => setFTSValue(e.target.value), 800);
    };

    const [selectedCategories, setSelectedCategories] = useState<MultiValue<CategoryOption>>(
        categories.map((category: any, idx: number) => ({
            value: category,
            label: category,
            ...categoriesStyles[category],
        })),
    );
    const [ftsValue, setFTSValue] = useState("");

    useEffect(
        () => loadEvents(currentDate, selectedCategories, ftsValue, setEvents),
        [currentDate, selectedCategories, ftsValue],
    );

    return (
        <>
            <div className="sticky top-[72px] md:top-[88px] lg:top-[88px] z-40 bg-white dark:bg-gray-800">
                <div className="flex items-center">
                    <Button
                        color=""
                        size="sm"
                        className="lg:hidden basis-1/4"
                        onClick={changeDate}
                        onKeyPress={changeDate}
                        data-month="previous"
                    >
                        <HiChevronLeft className="h-8 w-8" />
                    </Button>
                    <h1 className="basis-1/2 lg:grow text-xl md:text-4xl font-bold py-4 text-center">
                        {moment(calendar.props.date).format("MMMM YYYY")}
                    </h1>
                    <Button
                        color=""
                        size="sm"
                        className="lg:hidden basis-1/4"
                        onClick={changeDate}
                        onKeyPress={changeDate}
                        data-month="next"
                    >
                        <HiChevronRight className="h-8 w-8" />
                    </Button>
                </div>
                <div className="relative grid grid-cols-7 gap-x-4 gap-y-1 mb-2">
                    <div className="col-span-3 md:col-span-2 lg:col-span-1 flex items-center order-1">
                        <Button
                            color=""
                            size="sm"
                            onClick={changeDate}
                            onKeyPress={changeDate}
                            className="hidden lg:block"
                            data-month="previous"
                        >
                            <HiChevronLeft className="h-3 md:h-6 w-6 md:w-12" />
                        </Button>
                        <Button
                            color="purple"
                            size="sm"
                            onClick={changeDate}
                            onKeyPress={changeDate}
                            data-month="current"
                        >
                            Today
                        </Button>
                        <Button
                            color=""
                            size="sm"
                            onClick={changeDate}
                            onKeyPress={changeDate}
                            className="hidden lg:block"
                            data-month="next"
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
                    <div className="col-span-5 lg:col-span-3 order-3">
                        <Select
                            className="select-container"
                            classNamePrefix="select"
                            styles={{
                                container: (styles) => ({
                                    ...styles,
                                    zIndex: "30",
                                }),
                                multiValue: (styles, { data }) => ({
                                    ...styles,
                                    color: data.color,
                                    backgroundColor: data.backgroundColor,
                                }),
                                multiValueRemove: (styles, { data }) => ({
                                    ...styles,
                                    color: data.color,
                                    ":hover": {
                                        backgroundColor: data.backgroundColor,
                                    },
                                }),
                                option: (styles, { data, isFocused, isSelected }) => ({
                                    ...styles,
                                    color: data.color,
                                    backgroundColor: isFocused ? data.backgroundColor : undefined,
                                    opacity: isSelected ? 0.5 : undefined,
                                    ":active": {
                                        ...styles[":active"],
                                        backgroundColor: data.backgroundColor,
                                    },
                                }),
                                valueContainer: (styles) => ({
                                    ...styles,
                                    flexWrap: "nowrap",
                                }),
                            }}
                            closeMenuOnSelect={false}
                            data-filters-categories={true}
                            defaultValue={selectedCategories}
                            hideSelectedOptions={false}
                            isClearable={false}
                            isMulti={true}
                            isSearchable={false}
                            name="categories"
                            onChange={(newValue: MultiValue<CategoryOption>) => setSelectedCategories(newValue)}
                            options={categories.map((category: any, idx: number) => ({
                                value: category,
                                label: category,
                                ...categoriesStyles[category],
                            }))}
                            placeholder="Categories"
                        />
                    </div>
                    <div className="col-start-6 md:col-end-8 col-span-2 md:col-span-1 order-4 flex items-center justify-end gap-1">
                        <Dropdown
                            label={<HiOutlineEllipsisHorizontal className="h-5 w-5 text-violet-200 hover:text-white" />}
                            arrowIcon={false}
                            color="purple"
                            size="xs"
                        >
                            <Dropdown.Item onClick={showForm} onKeyPress={showForm}>
                                Subscriptions
                            </Dropdown.Item>
                            {session?.user.roles.includes(Role.contributor) && (
                                <Dropdown.Item>
                                    <Link href="/calendar/pendings">View pendings</Link>
                                </Dropdown.Item>
                            )}
                            <Dropdown.Item>
                                <Link href="/calendar/form">Add event</Link>
                            </Dropdown.Item>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </>
    );
};
