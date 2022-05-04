import { Client } from '@notionhq/client';
import { Event } from 'schemas/event';


const client = new Client({
    auth: process.env.NOTION_ACCESS_TOKEN,
});


export async function CreateEvent(event: Event) {
    const page = await client.pages.create({
        parent: {
            database_id: `${process.env.NOTION_EVENT_DATABASE_ID}`,
        },
        properties: {
            Name: {
                title: [
                    {
                        text: {
                            content: event.title,
                        },
                    },
                ],
            },
            Date: {
                date: {
                    start: event.date,
                },
            },
            'Tickets / Infos': {
                url: event.link ? event.link : null,
            },
            Tags: {
                multi_select: event.tags.map(function (currentElement: string) {
                    return {name: currentElement};
                })
            },
            City: {
                rich_text: [
                    {
                        text: {
                            content: event.city,
                        },
                    },
                ],
            },
            Country: {
                rich_text: [
                    {
                        text: {
                            content: event.country,
                        },
                    },
                ],
            },
        },
    });

    console.debug(page)
    return page
}
