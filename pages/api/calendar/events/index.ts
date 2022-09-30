import moment from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next'
import { Category } from '@prisma/client';

import { CreateEvent, GetEvents } from 'lib/calendar';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method == "POST") {
        const body = req.body
        let status: number, content: object;
        try {
            const pagesCount = await CreateEvent(body)
            status = 201
            content = {pagesCount: pagesCount}
        } catch (err) {
            console.error(err)
            status = 500
            content = { error: 'failed to create page' }
        }
        res.status(status).json(content)
    }
    else {
        const lbound = moment(req.query.lbound)
        const ubound = moment(req.query.ubound)
        const categories = req.query.categories as Category[]
        const fts = req.query.fts
        const events = await GetEvents(lbound, ubound, categories)
        res.status(200).json(events)
    }
}
