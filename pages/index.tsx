import { Card } from "flowbite-react";
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
    const ubound = moment(new Date()).add(7, "days");
    const events = await GetEvents(lbound, ubound, ["party"]);

    return {
        props: {
            events: events.map((event) => ({
                title: event.title,
                url: event.url,
                location: `${event.city}, ${event.country}`,
                start_at: moment(event.start_at).format("DD/MM"),
                end_at: event.end_at ? moment(event.end_at).format("DD/MM") : null,
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
        <Card className="mt-1">
            <div className="mb-4 flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">Next week events</h5>
                <Link href="/calendar" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
                    See all
                </Link>
            </div>
            <div className="flow-root overflow-y-auto h-60">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {events.map((event: any, idx: number) => (
                        <li key={idx} className="py-3 sm:py-4">
                          <div className="flex items-center space-x-4">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                {event.title}
                              </p>
                              <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                {event.location}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                                <div>{event.start_at}</div>
                                <div>{event.end_at && <HiArrowRight className="h-3 w-3" />}</div>
                                <div>{event.end_at}</div>
                            </div>
                          </div>
                        </li>
                    ))}
                </ul>
            </div>
        </Card>
    );
};

export default Home;
