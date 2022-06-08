import moment from 'moment';
import { PrismaClient } from '@prisma/client'

import prisma from 'lib/prisma';
import { Event } from 'schemas/event';


export async function CreateEvent(event: Event) {
    let start_at: moment.Moment = moment(event.start_at)
    let end_at: moment.Moment = moment(event.end_at)

    let result = await prisma.event.create({
        data: {
            ...event,
            url: event.url ? event.url : null,
            start_at: start_at.toDate(),
            end_at: end_at.isValid() ? end_at.toDate() : null,
            frequency: event.frequency ? event.frequency : null,
        }
    })
    return result
}

export async function GetEvents() {
    const events = await prisma.event.findMany({
        select: {
            title: true,
            url: true,
            start_at: true,
            end_at: true,
            frequency: true,
            city: true,
            country: true,
            categories: true,
        },
    })
    return events
}
