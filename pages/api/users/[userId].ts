import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { User, Role } from "@prisma/client";

import { authOptions } from "pages/api/auth/[...nextauth]";

const allowedMethods = ["POST", "PATCH"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await unstable_getServerSession(req, res, authOptions);
    const { userId } = req.query;
    if (!(session?.user.id === userId || session?.user.roles.includes(Role.admin))) {
        res.status(401).json({ message: "Insufficient rights" });
        return;
    }
    const method = req.method || "";
    if (!allowedMethods.includes(method)) {
        res.status(405).json({ message: "Method not allowed" });
        return;
    }
    if (!userId) {
        res.status(400).json({ message: "Invalid parameters" });
        return;
    }
    const data: User = req.body;
    let result = await prisma.user.update({
        where: {
            id: userId,
        },
        data: data,
    });
    res.status(200).json({ userId: userId });
}
