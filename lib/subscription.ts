import moment from 'moment';
import { Prisma } from '@prisma/client';

import prisma, { Subscription } from 'lib/prisma';


export async function GetNextSubscriptions(): Promise<Subscription[]> {
    let subscriptions: Subscription[] = []
    const date = moment().toDate()
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


export async function CreateSubscriber(subscriber: any) {
    const user = await prisma.user.findUnique({
        where: {
            email: subscriber.email,
        },
    })
    if (user) {
        console.log("User found, create subscriber only")
        const createUserAndSubscriber = await prisma.subscriber.create({
            data: {
                subscriptionId: 1,
                userId: user.id,
            },
        })
    }
    else {
        console.log("User not found, create all")
        const createUserAndSubscriber = await prisma.user.create({
            data: {
                name: subscriber.name,
                email: subscriber.email,
                subscriptions: {
                    create: [
                        { subscriptionId: 1 },
                    ],
                },
            },
        })
    }
    return true
}
