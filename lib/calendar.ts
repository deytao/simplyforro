import moment from 'moment';
import { Category, Event, Frequency, ValidationStatus } from '@prisma/client';

import prisma from 'lib/prisma';
import { EventInter } from 'schemas/event';


export async function CreateEvent(event: EventInter) {
    let start_at: moment.Moment = moment(event.start_at)
    let end_at: moment.Moment = moment(event.end_at)

    let result = await prisma.event.create({
        data: {
            ...event,
            url: event.url ? event.url : null,
            start_at: start_at.toDate(),
            end_at: end_at.isValid() ? end_at.toDate() : null,
            frequency: event.frequency ? event.frequency as Frequency : null,
            categories: event.categories as Category[],
        }
    })
    return result
}

export async function UpdateEvent(eventId: number, data: any) {
    let result = await prisma.event.update({
        where: {
            id: eventId,
        },
        data: data,
    })
    return result
}

export async function GetEvents(lbound: moment.Moment, ubound: moment.Moment, categories: Category[], validationStatus: ValidationStatus = "validated") {
    let events: Event[] = []
    try {
        events = await prisma.event.findMany({
            where: {
                OR: [{
                    start_at: {
                        gte: lbound.toDate(),
                        lte: ubound.toDate(),
                    },
                }, {
                    end_at: {
                        gte: lbound.toDate(),
                        lte: ubound.toDate(),
                    },
                }, {
                    AND: [{
                        start_at: {
                            lte: lbound.toDate(),
                        },
                        end_at: {
                            gte: ubound.toDate(),
                        },
                    }],
                }],
                categories: {
                    hasSome: categories,
                },
                validation_status: {
                    equals: validationStatus,
                },
            },
        })
    }
    catch (e) {
        console.error(e)
    }
    return events
}

export async function GetPendingEvents() {
    let events: Event[] = []
    try {
        events = await prisma.event.findMany({
            where: {
                validation_status: {
                    equals: ValidationStatus.pending,
                },
            },
        })
    }
    catch (e) {
        console.error(e)
    }
    return events
}
