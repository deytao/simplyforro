import type { NextApiRequest, NextApiResponse } from 'next'
import { CreateEvent } from 'lib/calendar';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body
  try {
    console.debug(body)
    const page = CreateEvent(body)
    res.redirect(307, '/calendar/form')
  } catch (err) {
    console.debug(err)
    res.status(500).send({ error: 'failed to fetch data' })
  }
}
