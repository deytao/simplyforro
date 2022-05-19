import { Client } from '@notionhq/client';


export const client = new Client({
    auth: process.env.NOTION_ACCESS_TOKEN,
});


export const getDatabase = async (databaseId: string, filter?: object) => {
    let query: {database_id: string, [k: string]: any} = {
        database_id: databaseId,
    }
    if (filter !== undefined) {
        query.filter = filter
    }
    const response = await client.databases.query(query);
    return response.results;
};


export const getNextEvents = async (databaseId: string) => {
    const data = await getDatabase(databaseId, {
        "property": "Date",
        "date": {
            "next_week": {},
        },
    });
    return data;
};


export const createPage = async (databaseId: string, properties: any) => {
    let page = await client.pages.create({
        parent: {
            database_id: databaseId,
        },
        properties: properties,
    });
}
