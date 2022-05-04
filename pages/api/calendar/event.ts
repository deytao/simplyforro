import type { NextApiRequest, NextApiResponse } from 'next'
import {Client} from '@notionhq/client';


const client = new Client({
    auth: process.env.NOTION_ACCESS_TOKEN,
});


interface Data {
    title: string,
    date: string,
    link: string,
    city: string,
    country: string,
    tags: string[],
}


async function createEvent(data: Data) {
    const page = await client.pages.create({
        parent: {
            database_id: `${process.env.NOTION_EVENT_DATABASE_ID}`,
        },
        properties: {
            Name: {
                title: [
                    {
                        text: {
                            content: data.title,
                        },
                    },
                ],
            },
            Date: {
                date: {
                    start: data.date,
                },
            },
            'Tickets / Infos': {
                url: data.link ? data.link : null,
            },
            Tags: {
                multi_select: data.tags.map(function (currentElement) {
                    return {name: currentElement};
                })
            },
            City: {
                rich_text: [
                    {
                        text: {
                            content: data.city,
                        },
                    },
                ],
            },
            Country: {
                rich_text: [
                    {
                        text: {
                            content: data.country,
                        },
                    },
                ],
            },
        },
    });

    console.debug(page)
    return page
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body
  try {
    console.debug(body)
    const page = createEvent(body)
    res.redirect(307, '/calendar/form')
  } catch (err) {
    res.status(500).send({ error: 'failed to fetch data' })
  }
}
