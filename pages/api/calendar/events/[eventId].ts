import moment from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next'
import { Category } from '@prisma/client';

import { UpdateEvent } from 'lib/calendar';

const allowedMethods = ["POST", "PATCH", "DELETE"]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const method = req.method || ""
    if (!allowedMethods.includes(method)) {
        res.status(405).json({})
        return
    }
    const { eventId } = req.query
    const event: Event = req.body
    const result = UpdateEvent(+eventId, event)
    res.status(200).json({"eventId": eventId})
}
