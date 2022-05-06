import { Client } from '@notionhq/client';
import moment from 'moment';
import { Event } from 'schemas/event';


const client = new Client({
    auth: process.env.NOTION_ACCESS_TOKEN,
});


const frequencyIntervals = {
    null: false,
    "": false,
    "daily": {"days": 1},
    "weekly": {"weeks": 1},
    "biweekly": {"weeks": 2},
    "monthly": {"months": 1},
}


export async function CreateEvent(event: Event) {
    let startDate: moment.Moment = moment(event.startDate)
    let endDate: moment.Moment = moment(event.endDate)
    let interval = frequencyIntervals[event.frequency]
    let dates: any = {}
    dates[startDate.format("YYYY-MM-DD")] = endDate.format("YYYY-MM-DD")
    while (interval && startDate.isSameOrBefore(endDate) && endDate.isValid()) {
        dates[startDate.format("YYYY-MM-DD")] = null
        startDate.add(interval)
    }
    for (let [startDate, endDate] of Object.entries(dates)) {
        let page = await client.pages.create({
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
                        start: startDate,
                        end: endDate === startDate ? null : endDate,
                    },
                },
                'Tickets / Infos': {
                    url: event.link ? event.link : null,
                },
                Tags: {
                    multi_select: event.tags.map((currentElement: string) => {
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
    }
    return true
}
