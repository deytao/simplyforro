import moment from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next'

import { GetEvents } from 'lib/calendar';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const lbound = moment(req.query.lbound)
  const ubound = moment(req.query.ubound)
  const categories = req.query.categories as String[]
  const events = await GetEvents(lbound, ubound, categories)
  res.status(200).json(events)
}
