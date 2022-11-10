import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { Category, Event, Role, ValidationStatus } from "@prisma/client";

import { CreateEvent, GetEvents } from "lib/calendar";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const session = await unstable_getServerSession(req, res, authOptions);
        const body = req.body;
        let status: number;
        let content: object;
        body.validation_status = ValidationStatus.pending;
        if (session?.user.roles.includes(Role.contributor)) {
            body.validation_status = ValidationStatus.validated;
        }
        try {
            const pagesCount = await CreateEvent(body);
            status = 201;
            content = { pagesCount: pagesCount };
        } catch (err) {
            console.error(err);
            status = 500;
            content = { error: "failed to create page" };
        }
        res.status(status).json(content);
    } else {
        const lbound = moment(req.query.lbound);
        const ubound = moment(req.query.ubound);
        const categories = req.query.categories as Category[];
        const searchedText = req.query.q as string;
        const events = await GetEvents(lbound, ubound, categories, searchedText);
        res.status(200).json(events);
    }
}
