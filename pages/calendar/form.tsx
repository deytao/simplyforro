import { Button, Checkbox, Label, Select, Spinner, TextInput, Toast } from "flowbite-react";
import moment from "moment";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { unstable_getServerSession } from "next-auth/next";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { HiOutlineXMark } from "react-icons/hi2";
import { Event, Role } from "@prisma/client";

import { EventPreview } from "components/EventPreview";
import { IPopup, Popup } from "components/Popup";
import prisma from "lib/prisma";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { eventSchema } from "schemas/event";

interface Props {
    event: Event;
}

const categories = {
    party: "Event where a DJ and/or a band is playing the music",
    pratica: "Event where participants are handling the music and practicing steps",
    class: "Regular event where a teacher is showing new steps or concepts",
    workshop: "Ponctual event where a guest teacher is handling the class",
    festival: "Event generally happening over few days with workshops and parties",
};

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
                    <form onSubmit={handleSubmit(submitForm)} method="POST" className="flex flex-col gap-2">
                        <input type="hidden" {...register("id")} id="event-id" />
                        <div>
                            <Label htmlFor="event-title" value="Title" />
                            <TextInput
                                {...register("title")}
                                id="event-title"
                                className={`${errors.name ? "border-red-500" : ""}`}
                                placeholder={`${placeholderEvent.title}`}
                            />
                            <p className="text-red-500 text-xs italic">{errors.title?.message}</p>
                        </div>

                        <div>
                            <Label htmlFor="event-url" value="Tickets / Infos" />
                            <TextInput
                                {...register("url")}
                                id="event-url"
                                className={`${errors.url ? "border-red-500" : ""}`}
                                placeholder={`${placeholderEvent.url}`}
                            />
                            <p className="text-red-500 text-xs italic">{errors.url?.message}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <Label htmlFor="event-start-date" value="From" />
                                <TextInput
                                    {...register("start_at")}
                                    id="event-start-date"
                                    type="date"
                                    className={`${errors.start_at ? "border-red-500" : ""}`}
                                    placeholder={`${placeholderEvent.start_at}`}
                                />
                                <p className="text-red-500 text-xs italic">{errors.start_at?.message}</p>
                            </div>

                            <div className="col-span-1">
                                <Label htmlFor="event-end-date" value="To" />
                                <TextInput
                                    {...register("end_at")}
                                    id="event-end-date"
                                    type="date"
                                    className={`${errors.end_at ? "border-red-500" : ""}`}
                                    placeholder={`${placeholderEvent.end_at}`}
                                />
                                <p className="text-red-500 text-xs italic">{errors.end_at?.message}</p>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="event-frequency" value="Frequency" />
                            <Select {...register("frequency")} id="event-frequency">
                                <option value="" />
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="biweekly">Biweekly</option>
                                <option value="monthly">Monthly</option>
                            </Select>
                            <p className="text-red-500 text-xs italic">{errors.frequency?.message}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <Label htmlFor="event-city" value="City" />
                                <TextInput
                                    {...register("city")}
                                    id="event-city"
                                    className={`${errors.end_at ? "border-red-500" : ""}`}
                                    placeholder={`${placeholderEvent.city}`}
                                />
                                <p className="text-red-500 text-xs italic">{errors.city?.message}</p>
                            </div>

                            <div className="col-span-1">
                                <Label htmlFor="event-country" value="Country" />
                                <TextInput
                                    {...register("country")}
                                    id="event-country"
                                    className={`${errors.end_at ? "border-red-500" : ""}`}
                                    placeholder={`${placeholderEvent.country}`}
                                />
                                <p className="text-red-500 text-xs italic">{errors.country?.message}</p>
                            </div>
                        </div>

                        <fieldset id="categories">
                            <legend className="text-base font-medium text-gray-900 dark:text-gray-300">Category</legend>
                            <p className="text-red-500 text-xs italic">{errors.categories?.message}</p>
                            <div className="flex flex-col gap-2 mt-2">
                                {Object.entries(categories).map(([name, description], idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`categories-${name}`}
                                            {...register(name)}
                                            value={name}
                                            className={errors.categories ? "border-red-500" : ""}
                                        />
                                        <div className="flex flex-col">
                                            <Label htmlFor={`categories-${name}`} className="capitalize">
                                                {name}
                                                <p className="text-xs font-normal text-gray-500 dark:text-gray-300 normal-case">
                                                    {description}
                                                </p>
                                            </Label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </fieldset>

                        <div className="flex justify-end gap-2 my-5">
                            <Button
                                color="light"
                                size="sm"
                                onClick={togglePreview}
                                onKeyPress={togglePreview}
                                className="basis-1/2 md:hidden"
                                data-preview-panel="event-preview"
                            >
                                Preview
                            </Button>
                            <Button
                                type="submit"
                                color="purple"
                                size="sm"
                                className={`grow ${isSubmitting && "cursor-not-allowed"}`}
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
                    </form>
                </div>

                <div className="hidden relative shadow p-2 md:block md:col-span-2">
                    <EventPreview eventData={previewState} />
                </div>

                <div
                    data-event-preview={true}
                    className="hidden fixed inset-0 bg-black/20 z-20"
                    aria-hidden="true"
                    onClick={togglePreview}
                    onKeyPress={togglePreview}
                />
                <div
                    data-event-preview={true}
                    className="hidden w-11/12 h-screen fixed bottom-0 right-0 bg-white dark:bg-gray-800 p-1 rounded-l-md shadow-xl z-20"
                >
                    <HiOutlineXMark
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
