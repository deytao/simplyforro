import moment from 'moment';
import { PrismaClient } from '@prisma/client'

import prisma from 'lib/prisma';
import { Event } from 'schemas/event';


export async function CreateEvent(event: Event) {
    let startDate: moment.Moment = moment(event.startDate)
    let endDate: moment.Moment = moment(event.endDate)

    let result = await prisma.event.create({
        data: {
            title: event.title,
            url: event.link ? event.link : null,
            start_at: startDate.toDate(),
            end_at: endDate.isValid() ? endDate.toDate() : null,
            frequency: event.frequency ? event.frequency : null,
            city: event.city,
            country: event.country,
            categories: event.tags,
        }
    })
    return result
}

export async function GetEvents() {
    const events = await prisma.event.findMany()
    return events
}
