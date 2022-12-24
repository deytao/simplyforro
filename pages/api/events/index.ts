import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { Category, Event, Role, ValidationStatus } from "@prisma/client";

import { CreateEvent, GetEvents } from "lib/calendar";
import { authOptions } from "pages/api/auth/[...nextauth]";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "4mb",
        },
    },
};

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
        const { categories: _categories, lbound: _lbound, ubound: _ubound, q } = req.query;
        const lbound = moment(_lbound);
        const ubound = moment(_ubound);
        if (lbound.isAfter(ubound)) {
            res.status(400).json({ message: "Invalid dates" });
            return;
        }
        if (ubound.diff(lbound, "days") > 42) {
            res.status(400).json({ message: "Too many days" });
            return;
        }
        let categories: string[] = [];
        if (_categories) {
            if (typeof _categories === "string") {
                categories.push(_categories);
            } else {
                categories = _categories;
            }
        }
        const events = await GetEvents(lbound, ubound, categories as Category[], q as string);
        res.status(200).json(events);
    }
}
