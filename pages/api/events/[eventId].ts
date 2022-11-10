import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { Category, Event, Role } from "@prisma/client";

import { DeleteEvent, UpdateEvent } from "lib/calendar";
import { authOptions } from "pages/api/auth/[...nextauth]";

const allowedMethods = ["POST", "PATCH", "DELETE"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session?.user.roles.includes(Role.contributor)) {
        res.status(401).json({ message: "Insufficient rights" });
        return;
    }
    const method = req.method || "";
    if (!allowedMethods.includes(method)) {
        res.status(405).json({ message: "Method not allowed" });
        return;
    }
    const { eventId } = req.query;
    if (!eventId) {
        res.status(400).json({ message: "Invalid parameters" });
        return;
    }
    if (method === "DELETE") {
        const result = DeleteEvent(+eventId);
    } else {
        const event: Event = req.body;
        const result = UpdateEvent(+eventId, event);
    }
    res.status(200).json({ eventId: eventId });
}
