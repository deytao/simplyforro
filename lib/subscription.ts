import moment from 'moment';
import { Frequency } from '@prisma/client';

import prisma, { Subscription } from 'lib/prisma';


export async function GetNextSubscriptions(): Promise<Subscription[]> {
    let subscriptions: Subscription[] = []
    const date = moment().add({'hours': 3}).toDate()
    try {
        subscriptions = await prisma.subscription.findMany({
            where: {
                active: {
                    equals: true,
                },
                nextRun: {
                    lte: date,
                },
            },
            include: {
                subscribers: {
                    include: {
                        user: true,
                    },
                },
            },
        })
    }
    catch (e) {
        console.error(e)
    }
    return subscriptions
}
