import type { NextApiRequest, NextApiResponse } from 'next'
import { CreateEvent } from 'lib/calendar';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
