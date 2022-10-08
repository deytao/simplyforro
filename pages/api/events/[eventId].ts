import moment from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth/next'
import { Category, Role } from '@prisma/client';

import { UpdateEvent } from 'lib/calendar';
import { authOptions } from "pages/api/auth/[...nextauth]"

const allowedMethods = ["POST", "PATCH", "DELETE"]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const session = await unstable_getServerSession(req, res, authOptions)
    if (!session || !session.user.roles.includes(Role.contributor)) {
        res.status(401)
        res.end()
    }
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
