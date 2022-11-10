import moment from "moment";
import { Client } from "@notionhq/client";

export const client = new Client({
    auth: process.env.NOTION_ACCESS_TOKEN,
});

export const getDatabase = async (
    databaseId: string,
    filter?: { [k: string]: any },
    sorts?: { property: string; direction: string }[],
) => {
    let query: { database_id: string; [k: string]: any } = {
        database_id: databaseId,
    };
    if (filter !== undefined) {
        query.filter = filter;
    }
    if (sorts !== undefined) {
        query.sorts = sorts;
    }
    const response = await client.databases.query(query);
    return response.results;
};

export const getNextEvents = async (databaseId: string) => {
    const data = await getDatabase(
        databaseId,
        {
            property: "Date",
            date: {
                next_week: {},
            },
        },
        [
            {
                property: "Date",
                direction: "ascending",
            },
        ],
    );
    const events = data.map((item: any) => ({
        id: item.id.replace(/-/g, ""),
        database_id: item.parent.database_id.replace(/-/g, ""),
        title: item.properties.Name.title[0]?.plain_text,
        start_date: moment(item.properties.Date.date.start).format("DD.MM.YYYY"),
        end_date: item.properties.Date.date.end ? moment(item.properties.Date.date.end).format("DD.MM.YYYY") : null,
        location: item.properties.Location.formula.string,
    }));
    return events;
};

export const createPage = async (databaseId: string, properties: any) => {
    let page = await client.pages.create({
        parent: {
            database_id: databaseId,
        },
        properties: properties,
    });
};
