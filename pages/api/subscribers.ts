import moment from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from "next-auth/next"
import { Category, Event, Role, ValidationStatus } from '@prisma/client';

import { CreateSubscriber } from 'lib/subscription';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.status(405).end()
    }
    const body = req.body
    let status: number, content: object;
    try {
        const result = await CreateSubscriber(body)
        status = 201
        content = { result: result }
    } catch (err) {
        console.error(err)
        status = 500
        content = { error: 'failed to create subscriber' }
    }
    res.status(status).json(content)
}
