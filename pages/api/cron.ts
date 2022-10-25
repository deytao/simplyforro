import moment from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next'
import { Category, Event } from '@prisma/client';

import { GetEvents, frequencyIntervals } from 'lib/calendar'
import { sendBulkEmails } from 'lib/mailjet';
import { Subscription } from 'lib/prisma';
import { GetNextSubscriptions } from 'lib/subscription';

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
            const recipients = subscriptions.map((subscription) => {
                return subscription.subscribers.map((subscriber) => subscriber.user.email)
            }).flat()
            const lbound = moment(new Date())
            const ubound = moment(new Date()).add(7, "days").endOf("week")
            const result = GetEvents(lbound, ubound, Object.keys(Category) as Category[])
                .then((data: Event[]) => {
                    const events = data.map((event) => {
                        if (!event.frequency) {
                            return {
                                title: event.title,
                                date: moment(event.start_at).format("ddd Do of MMM YYYY"),
                                url: event.url,
                                categories: event.categories,
                            }
                        }
                        let eventDate = moment(event.start_at)
                        let lastDate = event.end_at && moment(event.end_at) < ubound ? moment(event.end_at).utc(true) : ubound
                        let events: {
                            title: string,
                            date: string,
                            url: string | null,
                            categories: Category[],
                        }[] = []
                        while (eventDate <= lastDate) {
                            if (eventDate >= lbound) {
                                events.push({
                                    title: event.title,
                                    date: eventDate.format("ddd Do of MMM YYYY"),
                                    url: event.url,
                                    categories: event.categories,
                                })
                            }
                            eventDate.add(frequencyIntervals[event.frequency])
                        }
                        return events
                    }).flat()
                    sendBulkEmails(recipients, 4304516, {events: events})
                })
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
