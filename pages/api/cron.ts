import moment from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next'
import { Category, Event } from '@prisma/client';

import { GetEvents, frequencyIntervals } from 'lib/calendar'
import { sendBulkEmails } from 'lib/mailjet';
import { Subscription } from 'lib/prisma';
import { GetNextSubscriptions } from 'lib/subscription';


const callbacks: {[key: string]: Function} = {
    "weekly-forro-calendar": async (subscription: Subscription): Promise<{recipients: string[], data: any}> => {
        const recipients = subscription.subscribers ? subscription.subscribers.map((subscriber) => subscriber.user.email) : []
        if (!recipients) {
            return {
                recipients: [],
                data: {},
            }
        }
        const lbound = moment(new Date())
        const ubound = moment(new Date()).add(7, "days").endOf("week")
        const data = await GetEvents(lbound, ubound, Object.keys(Category) as Category[])
        const events = data.map((event) => {
            if (!event.frequency) {
                return {
                    title: event.title,
                    date: moment(event.start_at),
                    url: event.url,
                    categories: event.categories,
                    city: event.city,
                    country: event.country,
                }
            }
            let eventDate = moment(event.start_at)
            let lastDate = event.end_at && moment(event.end_at) < ubound ? moment(event.end_at).utc(true) : ubound
            let events: {
                title: string,
                date: moment.Moment,
                url: string | null,
                categories: Category[],
                city: string,
                country: string,
            }[] = []
            while (eventDate <= lastDate) {
                if (eventDate >= lbound) {
                    events.push({
                        title: event.title,
                        date: eventDate,
                        url: event.url,
                        categories: event.categories,
                        city: event.city,
                        country: event.country,
                    })
                }
                eventDate.add(frequencyIntervals[event.frequency])
            }
            return events
        }).flat()
        events.sort((event_a, event_b) => {
            if (event_a.date.isBefore(event_b.date)) {
                return -1
            }
            if (event_a.date.isAfter(event_b.date)) {
                return 1
            }
            return 0
        })
        return {
            recipients: recipients,
            data: {events: events.map((event) => {
                return {
                    ...event,
                    date: event.date.format("ddd Do of MMM YYYY"),
                }
            })}
        }
    },
    "last-updated-events-weekly": async (subscription: Subscription): Promise<{recipients: string[], data: any}> => {
        return {
            recipients: [],
            data: {},
        }
    }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const { CRON_TOKEN } = process.env;
    if (!req.headers.authorization || req.method !== "POST") {
        res.status(401).end()
    }
    const token = req.headers.authorization!.split(" ")[1]

    try {
        if (token === CRON_TOKEN) {
            // Process the POST request
            const subscriptions: Subscription[] = await GetNextSubscriptions()
            for (const subscription of subscriptions) {
                let result = callbacks[subscription.slug](subscription)
                    .then(({recipients, data}: {recipients: string[], data: any}) => {
                        sendBulkEmails(4304516, recipients, data)
                    })
                let lastRun = moment()
                let shiftSubscription = await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        lastRun: lastRun.toDate(),
                        nextRun: moment(lastRun).add(frequencyIntervals[subscription.frequency]).toDate(),
                    },
                })
            }
            res.status(200).json("success")
        }
        else {
            res.status(401)
        }
    } catch(err) {
        res.status(500)
    }
    res.end()
}
