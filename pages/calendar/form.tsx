import { Button, Spinner } from "flowbite-react";
import moment from "moment";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { unstable_getServerSession } from "next-auth/next";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Event, Role } from "@prisma/client";

import { EventPreview } from "components/EventPreview";
import { IPopup, Popup } from "components/Popup";
import prisma from "lib/prisma";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { eventSchema } from "schemas/event";

interface Props {
    event: Event;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    const { eventId } = context.query;
    let event: Event | null = null;
    if (eventId && session?.user.roles.includes(Role.contributor)) {
        event = await prisma.event.findUnique({
            where: {
                id: +eventId,
            },
        });
    }

    return {
        props: {
            event: event
                ? {
                      id: event.id,
                      title: event.title,
                      url: event.url,
                      city: event.city,
                      country: event.country,
                      frequency: event.frequency ? event.frequency : "",
                      categories: event.categories,
                      start_at: moment(event.start_at).format("YYYY-MM-DD"),
                      end_at: event.end_at ? moment(event.end_at).format("YYYY-MM-DD") : null,
                  }
                : null,
        },
    };
};

const commonClassnames = "flex-1 block";

const CalendarForm: NextPage<Props> = ({ event }) => {
    const formOptions = {
        resolver: yupResolver(eventSchema),
        defaultValues: event,
    };
    const { register, handleSubmit, formState, watch } = useForm(formOptions);
    const { errors } = formState;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [popup, setPopup] = useState<IPopup>({ isOpen: false });
    const placeholderEvent = {
        title: "FENFIT",
        url: "https://www.example.com",
        start_at: "2022-04-23",
        end_at: "",
        frequency: "",
        city: "Itaunas",
        country: "Brazil",
        categories: ["party", "class"],
    };
    const [previewState, setPreviewState] = useState<Event>(event || placeholderEvent);

    const router = useRouter();
    const refreshData = () => {
        router.replace(router.asPath);
    };

    watch((data: any, options) => {
        const newEvent = {
            title: data.title || placeholderEvent.title,
            url: data.url || placeholderEvent.url,
            start_at: data.start_at || placeholderEvent.start_at,
            end_at: data.end_at || placeholderEvent.end_at,
            frequency: data.frequency || placeholderEvent.frequency,
            city: data.city || placeholderEvent.city,
            country: data.country || placeholderEvent.country,
            categories: data.categories || placeholderEvent.categories,
        } as Event;
        setPreviewState(newEvent);
    });

    async function submitForm(formData: object) {
        if (isSubmitting) {
            return false;
        }
        setIsSubmitting(true);
        const event = eventSchema.cast(formData);
        const { id: eventId, ...eventData } = event;
        const endpoint = `/api/events/${eventId}`;
        const JSONdata = JSON.stringify(eventData);

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
                setIsSubmitting(false);
                setPopup({
                    isOpen: true,
                    message: "Your event has been created. It will be validated and added to the calendar soon.",
                    buttons: [
                        {
                            title: "Close",
                            color: "success",
                        },
                    ],
                });
                refreshData();
            })
            .catch((error) => {
                setPopup({
                    isOpen: true,
                    message: error.message,
                    buttons: [
                        {
                            title: "Close",
                            color: "failure",
                        },
                    ],
                });
            });
        return false;
    }

    const togglePreview = (el: any) => {
        const elements = document.querySelectorAll("[data-event-preview]") as NodeListOf<HTMLElement>;
        elements.forEach((el) => {
            if (el.offsetParent) {
                el.classList.add("hidden");
            } else {
                el.classList.remove("hidden");
            }
        });
    };

    return (
        <>
            <h1 className="text-xl md:text-6xl font-bold py-4 text-center">Event</h1>

            <Popup popup={popup} setPopup={setPopup} />

            <div className="relative md:grid md:grid-cols-4 md:gap-4">
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit(submitForm)} method="POST">
                        <input type="hidden" {...register("id")} id="event-id" />
                        <div className="shadow sm:rounded-md sm:overflow-hidden">
                            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="col-span-4 md:col-span-2">
                                        <label
                                            htmlFor="event-title"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Title
                                        </label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <input
                                                type="text"
                                                {...register("title")}
                                                id="event-title"
                                                className={`${commonClassnames} ${
                                                    errors.title ? "border-red-500" : ""
                                                }`}
                                                placeholder={`${placeholderEvent.title}`}
                                            />
                                        </div>
                                        <p className="text-red-500 text-xs italic">{errors.title?.message}</p>
                                    </div>

                                    <div className="col-span-4">
                                        <label htmlFor="event-url" className="block text-sm font-medium text-gray-700">
                                            {" "}
                                            Tickets / Infos{" "}
                                        </label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <input
                                                type="text"
                                                {...register("url")}
                                                id="event-url"
                                                className={`${commonClassnames} ${errors.url ? "border-red-500" : ""}`}
                                                placeholder={`${placeholderEvent.url}`}
                                            />
                                        </div>
                                        <p className="text-red-500 text-xs italic">{errors.url?.message}</p>
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label
                                            htmlFor="event-start-date"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            From
                                        </label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <input
                                                type="date"
                                                {...register("start_at")}
                                                id="event-start-date"
                                                className={`${commonClassnames} ${
                                                    errors.start_at ? "border-red-500" : ""
                                                }`}
                                                placeholder={`${placeholderEvent.start_at}`}
                                            />
                                        </div>
                                        <p className="text-red-500 text-xs italic">{errors.start_at?.message}</p>
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label
                                            htmlFor="event-end-date"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            To
                                        </label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <input
                                                type="date"
                                                {...register("end_at")}
                                                id="event-end-date"
                                                className={`${commonClassnames} ${
                                                    errors.end_at ? "border-red-500" : ""
                                                }`}
                                                placeholder={`${placeholderEvent.end_at}`}
                                            />
                                        </div>
                                        <p className="text-red-500 text-xs italic">{errors.end_at?.message}</p>
                                    </div>

                                    <div className="col-span-4 md:col-span-2">
                                        <label
                                            htmlFor="event-frequency"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Frequency
                                        </label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <select
                                                {...register("frequency")}
                                                id="event-frequency"
                                                className={`${commonClassnames}`}
                                            >
                                                <option value="" />
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="biweekly">Biweekly</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                        </div>
                                        <p className="text-red-500 text-xs italic">{errors.frequency?.message}</p>
                                    </div>

                                    <div className="col-span-4 grid grid-cols-2 gap-4">
                                        <div className="col-span-1">
                                            <label
                                                htmlFor="event-city"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                City
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <input
                                                    type="text"
                                                    {...register("city")}
                                                    id="event-city"
                                                    className={`${commonClassnames} ${
                                                        errors.city ? "border-red-500" : ""
                                                    }`}
                                                    placeholder={`${placeholderEvent.city}`}
                                                />
                                            </div>
                                            <p className="text-red-500 text-xs italic">{errors.city?.message}</p>
                                        </div>

                                        <div className="col-span-1">
                                            <label
                                                htmlFor="event-country"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Country
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <input
                                                    type="text"
                                                    {...register("country")}
                                                    id="event-country"
                                                    className={`${commonClassnames} ${
                                                        errors.country ? "border-red-500" : ""
                                                    }`}
                                                    placeholder={`${placeholderEvent.country}`}
                                                />
                                            </div>
                                            <p className="text-red-500 text-xs italic">{errors.country?.message}</p>
                                        </div>
                                    </div>
                                </div>

                                <fieldset>
                                    <legend className="text-base font-medium text-gray-900">Category</legend>
                                    <p className="text-red-500 text-xs italic">{errors.categories?.message}</p>
                                    <div className="mt-4 space-y-4">
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    id="categories-party"
                                                    {...register("categories")}
                                                    value="party"
                                                    className={errors.categories ? "border-red-500" : ""}
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="categories-party" className="font-medium text-gray-700">
                                                    Party
                                                    <p className="text-gray-500 font-normal">
                                                        Event where a DJ and/or a band is playing the music
                                                    </p>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    id="categories-pratica"
                                                    {...register("categories")}
                                                    value="pratica"
                                                    className={errors.categories ? "border-red-500" : ""}
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label
                                                    htmlFor="categories-pratica"
                                                    className="font-medium text-gray-700"
                                                >
                                                    Pratica
                                                    <p className="text-gray-500 font-normal">
                                                        Event where participants are handling the music and practicing
                                                        steps
                                                    </p>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    id="categories-class"
                                                    {...register("categories")}
                                                    value="class"
                                                    className={errors.categories ? "border-red-500" : ""}
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="categories-class" className="font-medium text-gray-700">
                                                    Class
                                                    <p className="text-gray-500 font-normal">
                                                        Regular event where a teacher is showing new steps or concepts
                                                    </p>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    id="categories-workshop"
                                                    {...register("categories")}
                                                    value="workshop"
                                                    className={errors.categories ? "border-red-500" : ""}
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label
                                                    htmlFor="categories-workshop"
                                                    className="font-medium text-gray-700"
                                                >
                                                    Workshop
                                                    <p className="text-gray-500 font-normal">
                                                        Ponctual event where a guest teacher is handling the class
                                                    </p>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    id="categories-festival"
                                                    {...register("categories")}
                                                    value="festival"
                                                    className={errors.categories ? "border-red-500" : ""}
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label
                                                    htmlFor="categories-festival"
                                                    className="font-medium text-gray-700"
                                                >
                                                    Festival
                                                    <p className="text-gray-500 font-normal">
                                                        Event generally happening over few days with workshops and
                                                        parties
                                                    </p>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>

                            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex gap-2">
                                <Button
                                    color="light"
                                    size="sm"
                                    onClick={togglePreview}
                                    onKeyPress={togglePreview}
                                    className="md:hidden"
                                    data-preview-panel="event-preview"
                                >
                                    Preview
                                </Button>
                                <Button
                                    type="submit"
                                    color="purple"
                                    size="sm"
                                    className={`${isSubmitting && "cursor-not-allowed"}`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && (
                                        <div className="mr-3">
                                            <Spinner size="sm" light={true} />
                                        </div>
                                    )}
                                    {isSubmitting ? "Processing" : "Send"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="hidden relative shadow p-2 md:block md:col-span-2">
                    <EventPreview eventData={previewState} />
                </div>

                <div
                    data-event-preview={true}
                    className="hidden fixed inset-0 bg-black/20"
                    aria-hidden="true"
                    onClick={togglePreview}
                    onKeyPress={togglePreview}
                />
                <div
                    data-event-preview={true}
                    className="hidden w-11/12 h-screen fixed bottom-0 right-0 bg-white p-1 rounded-l-md shadow-xl z-20"
                >
                    <XMarkIcon
                        className="h-8 w-8 absolute top-16 right-0 inline cursor-pointer"
                        onClick={togglePreview}
                        onKeyPress={togglePreview}
                    />
                    <EventPreview eventData={previewState} />
                </div>
            </div>
        </>
    );
};

export default CalendarForm;
