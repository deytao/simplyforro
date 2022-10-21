import moment from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next'
import { Category, Event, Role, ValidationStatus } from '@prisma/client';

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
            res.status(200).json({ success: 'true' })
        } else {
            res.status(401)
        }
    } catch(err) {
        res.status(500)
    }
    res.end()
}
