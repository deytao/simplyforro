import type { NextApiRequest, NextApiResponse } from 'next'
import { CreateEvent } from 'lib/calendar';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body
  try {
    const pagesCount = await CreateEvent(body)
    res.status(201).json({pagesCount: pagesCount})
  } catch (err) {
    console.debug(err)
    res.status(500).send({ error: 'failed to create page' })
  }
}
