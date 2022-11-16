import moment from "moment";
import { Prisma, User } from "@prisma/client";

import prisma from "lib/prisma";


export async function UpdateUser(userId: string, user: User) {
    let result = await prisma.event.update({
        where: {
            id: userId,
        },
        data: user,
    });
    return result;
}
