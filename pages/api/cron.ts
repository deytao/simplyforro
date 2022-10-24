import moment from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next'
import { Category, Event, Role, Subscription } from '@prisma/client';

import { sendBulkEmails } from 'lib/mailjet';
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
            const result = sendBulkEmails(recipients, "Weekly Forró Calendar", "Event this week", "<h1>Event this week</h1>")
            res.status(200).json(result)
        }
        else {
            res.status(401)
        }
    } catch(err) {
        res.status(500)
    }
    res.end()
}
