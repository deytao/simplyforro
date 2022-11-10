import moment from "moment";
import { useState } from "react";

export const EventDetailsSimple = ({ event, className = "", style = {} }) => (
    <div className={className} style={style}>
        <div className="text-sm font-bold">
            <a href={event.url} target="_blank" rel="noreferrer">
                {event.title}
            </a>
        </div>
        <div className="text-sm">
            {event.city}, {event.country}
        </div>
        {event.categories?.map((category, idx) => (
            <span key={`${idx}`} className={`event-tag event-tag-${category}`}>
                {category}
            </span>
        ))}
    </div>
);

export const EventDetails = ({ event, extraClasses = "", extraStyles = {} }) => (
    <EventDetailsSimple
        event={event}
        className={`shadow border rounded-md p-2 text-left m-1 ${extraClasses}`}
        style={extraStyles}
    />
);

export const EventPreview = ({ eventData }) => {
    let start_at = moment(eventData.start_at);
    let end_at = moment(eventData.end_at);
    return (
        <>
            {/* UNIQUE */}
            {(start_at.isSame(end_at) || !end_at.isValid()) && (
                <div className="w-1/3 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <span className="text-sm inline-block w-full">{start_at.format("DD MMM")}</span>
                    <EventDetails event={eventData} />
                </div>
            )}

            {/* REPEAT */}
            {start_at.isBefore(end_at) && eventData.frequency && (
                <div className="flex gap-1 md:gap-2 w-11/12 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <div className="w-1/3">
                        <span className="text-sm inline-block w-full text-right">{start_at.format("DD MMM")}</span>
                        <EventDetails event={eventData} />
                    </div>
                    <div className="w-1/3">
                        <span className="text-sm inline-block w-full text-right">...</span>
                        <EventDetails event={eventData} />
                    </div>
                    <div className="w-1/3">
                        <span className="text-sm inline-block w-full text-right">{end_at.format("DD MMM")}</span>
                        <EventDetails event={eventData} />
                    </div>
                </div>
            )}

            {/* RANGE */}
            {start_at.isBefore(end_at) && !eventData.frequency && (
                <div className="w-11/12 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <span className="text-sm inline-block w-1/3 text-right pr-2">{start_at.format("DD MMM")}</span>
                    <span className="text-sm inline-block w-1/3 text-right pr-2">...</span>
                    <span className="text-sm inline-block w-1/3 text-right pr-2">{end_at.format("DD MMM")}</span>
                    <EventDetails event={eventData} />
                </div>
            )}
        </>
    );
};
