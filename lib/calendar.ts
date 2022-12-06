import moment from "moment";
import { Category, Event, Frequency, Prisma, ValidationStatus } from "@prisma/client";

import prisma from "lib/prisma";

export const frequencyIntervals: { [key: string]: object } = {
    daily: { days: 1 },
    weekly: { weeks: 1 },
    biweekly: { weeks: 2 },
    monthly: { weeks: 4 },
};

export async function CreateEvent(event: Event) {
    let start_at: moment.Moment = moment(event.start_at);
    let end_at: moment.Moment = moment(event.end_at);

    let result = await prisma.event.create({
        data: {
            ...event,
            url: event.url ? event.url : null,
            start_at: start_at.toDate(),
            end_at: end_at.isValid() ? end_at.toDate() : null,
            frequency: event.frequency ? event.frequency : null,
            categories: event.categories,
        },
    });
    return result;
}

export async function UpdateEvent(eventId: number, event: Event) {
    let start_at: moment.Moment = moment(event.start_at);
    let end_at: moment.Moment = moment(event.end_at);

    let result = await prisma.event.update({
        where: {
            id: eventId,
        },
        data: {
            ...event,
            url: event.url ? event.url : null,
            start_at: start_at.toDate(),
            end_at: end_at.isValid() ? end_at.toDate() : null,
            frequency: event.frequency ? (event.frequency) : null,
            categories: event.categories,
        },
    });
    return result;
}

export async function DeleteEvent(eventId: number) {
    let result = await prisma.event.delete({
        where: {
            id: eventId,
        },
    });
    return result;
}

export async function GetEvents(
    lbound: moment.Moment,
    ubound: moment.Moment,
    categories: Category[],
    searchedText: string = "",
    validationStatus: ValidationStatus = "validated",
) {
    const formatDate = (date: moment.Moment) => date.format("YYYY-MM-DD");
    const fts = searchedText.replace(/\W/g, " ").replace(/\s+/g, " ").trim().split(" ").join(" | ");
    try {
        const events = prisma.$queryRaw<Event[]>`
            SELECT *
            FROM event
            WHERE validation_status = ${validationStatus}::"ValidationStatus"
            AND categories && ${categories}::"Category"[]
            AND (
                    tsrange(${formatDate(lbound)}::date, ${formatDate(ubound)}::date, '[]') @> start_at
                OR tsrange(${formatDate(lbound)}::date, ${formatDate(ubound)}::date, '[]') @> end_at
                OR (
                        start_at < ${formatDate(lbound)}::date
                    AND end_at > ${formatDate(ubound)}::date
                )
            )
            ${
                fts
                    ? Prisma.sql`AND (
                    to_tsvector('english', title) @@ to_tsquery('english', ${fts})
                OR to_tsvector('english', city) @@ to_tsquery('english', ${fts})
                OR to_tsvector('english', country) @@ to_tsquery('english', ${fts})
                OR to_tsvector('french', title) @@ to_tsquery('french', ${fts})
                OR to_tsvector('french', city) @@ to_tsquery('french', ${fts})
                OR to_tsvector('french', country) @@ to_tsquery('french', ${fts})
                OR to_tsvector('german', title) @@ to_tsquery('german', ${fts})
                OR to_tsvector('german', city) @@ to_tsquery('german', ${fts})
                OR to_tsvector('german', country) @@ to_tsquery('german', ${fts})
                OR to_tsvector('portuguese', title) @@ to_tsquery('portuguese', ${fts})
                OR to_tsvector('portuguese', city) @@ to_tsquery('portuguese', ${fts})
                OR to_tsvector('portuguese', country) @@ to_tsquery('portuguese', ${fts})
            )`
                    : Prisma.empty
            }
        `;
        return events;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function GetLastUpdatedEvents(date: moment.Moment) {
    const lbound = moment().subtract(1, "days").startOf("day");
    const ubound = moment();
    try {
        const events = await prisma.event.findMany({
            where: {
                updatedAt: {
                    gte: lbound.toDate(),
                    lte: ubound.toDate(),
                },
                validation_status: ValidationStatus.validated,
            },
        });
        return events;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function CountPendingEvents() {
    try {
        return (
            await prisma.event.aggregate({
                _count: {
                    id: true,
                },
                where: {
                    validation_status: {
                        equals: ValidationStatus.pending,
                    },
                },
            })
        )._count.id;
    } catch (e) {
        console.error(e);
    }
    return 0;
}

export async function GetPendingEvents() {
    let events: Event[] = [];
    try {
        events = await prisma.event.findMany({
            where: {
                validation_status: {
                    equals: ValidationStatus.pending,
                },
            },
        });
    } catch (e) {
        console.error(e);
    }
    return events;
}
