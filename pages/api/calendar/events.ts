import type { NextApiRequest, NextApiResponse } from 'next'

import { GetEvents } from 'lib/calendar';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body
  const events = await GetEvents()
  res.status(200).json(events)
}
