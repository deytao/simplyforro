import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body
  try {
    console.log(body)
    res.redirect(307, '/calendar/form')
  } catch (err) {
    res.status(500).send({ error: 'failed to fetch data' })
  }
}
