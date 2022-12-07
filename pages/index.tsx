import moment from "moment";
import type { NextPage } from "next";
import Link from "next/link";
import { Event } from "@prisma/client";
import { HiArrowRight } from "react-icons/hi2";

import { GetEvents } from "lib/calendar";

interface Props {
    events: Event[];
}

export const getStaticProps = async () => {
    const lbound = moment(new Date());
    const ubound = moment(new Date()).add(7, "days").endOf("week");
    const events = await GetEvents(lbound, ubound, ["party"]);

    return {
        props: {
            events: events.map((event) => ({
                title: event.title,
                url: event.url,
                location: `${event.city}, ${event.country}`,
                start_at: moment(event.start_at).format("YYYY-MM-DD"),
                end_at: event.end_at ? moment(event.end_at).format("YYYY-MM-DD") : null,
            })),
        },
        // Next.js will attempt to re-generate the page:
        // - When a request comes in
        // - At most once every second
        revalidate: 600, // In seconds
    };
};

const Home: NextPage<Props> = ({ events }) => {
    return (
        <div className="mt-6 grid grid-cols-2 gap-4 max-w-4xl sm:w-full">
            <div className="rounded-xl border p-6 text-left">
                <h3 className="text-2xl font-bold">Next week events</h3>
                <div className="overflow-y-auto h-60 rounded p-2 border bg-gray-100">
                    {events.map((event: any, idx: number) => (
                        <div key={idx} className="p-2 rounded hover:bg-gray-200 focus:bg-gray-200">
                            <a
                                href={event.url}
                                className="hover:text-blue-600 focus:text-blue-600"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {event.title}
                            </a>
                            <br />
                            {event.start_at}
                            <HiArrowRight className="h-6 w-6 -mt-1 inline" />
                            {event.end_at}
                            <br />
                            {event.location}
                            <br />
                        </div>
                    ))}
                </div>
                <Link href="/calendar" className="mt-4 text-xl hover:text-blue-600 focus:text-blue-600">
                    See all
                </Link>
            </div>

            <Link
                href="/calendar/form"
                className="rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
            >
                <h3 className="text-2xl font-bold">Add events</h3>
                <p className="mt-4 text-xl">Help us inform the community about the next dances.</p>
            </Link>
        </div>
    );
};

export default Home;
