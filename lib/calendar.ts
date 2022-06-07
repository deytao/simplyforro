import moment from 'moment';
import { PrismaClient } from '@prisma/client'

import { Event } from 'schemas/event';
import { createPage } from 'lib/notion';


const prisma = new PrismaClient({})


const frequencyIntervals: {[key: string]: object} = {
    "daily": {"days": 1},
    "weekly": {"weeks": 1},
    "biweekly": {"weeks": 2},
    "monthly": {"months": 1},
}


export async function CreateEvent(event: Event) {
    let startDate: moment.Moment = moment(event.startDate)
    let endDate: moment.Moment = moment(event.endDate)
    let interval = event.frequency != null ? frequencyIntervals[event.frequency] : false
    let dates: {[key: string]: string | null} = {}
    dates[startDate.format("YYYY-MM-DD")] = endDate.isValid() ? endDate.format("YYYY-MM-DD") : null
    while (interval && startDate.isSameOrBefore(endDate) && endDate.isValid()) {
        dates[startDate.format("YYYY-MM-DD")] = null
        startDate.add(interval)
    }
    let pagesCount = 0
    for (let [startDate, endDate] of Object.entries(dates)) {
        let page = await createPage(
            `${process.env.NOTION_PENDINGS_DATABASE_ID}`,
            {
                "Name": {
                    "title": [
                        {
                            "text": {
                                "content": event.title,
                            },
                        },
                    ],
                },
                "Date": {
                    "date": {
                        "start": startDate,
                        "end": endDate === startDate ? null : endDate,
                    },
                },
                'Tickets / Infos': {
                    "url": event.link ? event.link : null,
                },
                "Tags": {
                    "multi_select": event.tags.map((currentElement: any) => {
                        return {name: currentElement};
                    })
                },
                "City": {
                    "rich_text": [
                        {
                            "text": {
                                "content": event.city,
                            },
                        },
                    ],
                },
                "Country": {
                    "rich_text": [
                        {
                            "text": {
                                "content": event.country,
                            },
                        },
                    ],
                },
            },
        );
        let result = await prisma.event.create({
            data: {
                title: event.title,
                url: event.link ? event.link : null,
                start_at: moment(startDate).toDate(),
                end_at: endDate === startDate ? null : moment(endDate).toDate(),
                city: event.city,
                country: event.country,
                categories: event.tags,
            }
        })
        pagesCount = pagesCount + 1
    }
    return pagesCount
}
