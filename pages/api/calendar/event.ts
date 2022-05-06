import type { NextApiRequest, NextApiResponse } from 'next'
import { CreateEvent } from 'lib/calendar';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body
  try {
    console.debug(body)
    const result = CreateEvent(body)
    res.status(201).json({})
  } catch (err) {
    console.debug(err)
    res.status(500).send({ error: 'failed to create page' })
  }
}
