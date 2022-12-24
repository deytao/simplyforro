import { Badge, Button, Checkbox, Dropdown, Label, TextInput } from "flowbite-react";
import moment from "moment";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Event, Role } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Select, { ActionMeta, MultiValue } from "react-select";
import { yupResolver } from "@hookform/resolvers/yup";
import { HiChevronLeft, HiChevronRight, HiOutlineEllipsisHorizontal } from "react-icons/hi2";
import { IoLocationOutline } from "react-icons/io5";
import useSWR from "swr";

import { IModal, Modal } from "components/Modal";
import { fetcherEvents, frequencyIntervals, ICategoryOption } from "lib/calendar";
import { Subscription } from "lib/prisma";
import { categories } from "schemas/event";
import { GetSubscriptions } from "lib/subscription";
import { subscriberSchema } from "schemas/subscriber";

interface ToolbarProps {
    calendar: any;
    setEvents: Function;
    setFilters: Function;
    subscriptions: Subscription[];
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

export const Toolbar = ({ calendar, setEvents, setFilters, subscriptions }: ToolbarProps) => {
    const { data: session } = useSession();
    const [currentDate, setCurrentDate] = useState(moment(calendar.props.date));
    const [modal, setModal] = useState<IModal>({
        isOpen: false,
    });
    const { register, handleSubmit, formState } = useForm({ resolver: yupResolver(subscriberSchema) });
    const { errors } = formState;
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

    const [selectedCategories, setSelectedCategories] = useState<MultiValue<ICategoryOption>>(
        categories.map((category: any, idx: number) => ({
            value: category,
            label: category,
            ...categoriesStyles[category],
        })),
    );
    const [ftsValue, setFTSValue] = useState("");

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
                                <legend className="text-base font-medium text-gray-900 dark:text-white">
                                    Subscriptions
                                </legend>
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

    const { data: events } = useSWR(["/api/events", currentDate, selectedCategories, ftsValue], fetcherEvents);
    useEffect(() => setEvents(events), [events]);
    useEffect(
        () =>
            setFilters({
                date: currentDate,
                categories: selectedCategories,
                q: ftsValue,
            }),
        [currentDate, selectedCategories, ftsValue],
    );

    return (
        <>
            <Modal modal={modal} setModal={setModal} />
            <div className="sticky top-[72px] md:top-[88px] lg:top-[88px] z-40 pb-2 bg-white dark:bg-gray-800">
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
                <div className="flex flex-col gap-1">
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
                        onChange={(newValue: MultiValue<ICategoryOption>) => setSelectedCategories(newValue)}
                        options={categories.map((category: any, idx: number) => ({
                            value: category,
                            label: category,
                            ...categoriesStyles[category],
                        }))}
                        placeholder="Categories"
                    />
                    <div className="flex gap-1">
                        <div className="flex items-center">
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
                        <div className="grow flex justify-center">
                            <TextInput
                                key="fts-field"
                                onChange={changeFTS}
                                placeholder="Search..."
                                defaultValue={ftsValue}
                                data-filters-fts={true}
                            />
                        </div>
                        <div className="flex items-center justify-end gap-1">
                            <Dropdown
                                label={
                                    <HiOutlineEllipsisHorizontal className="h-5 w-5 text-violet-200 hover:text-white" />
                                }
                                arrowIcon={false}
                                color="purple"
                                size="sm"
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
            </div>
        </>
    );
};
