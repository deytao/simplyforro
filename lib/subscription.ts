import moment from 'moment';
import { Prisma, User } from '@prisma/client';

import prisma, { Subscription } from 'lib/prisma';


export async function GetSubscriptions(): Promise<Subscription[]> {
    let subscriptions: Subscription[] = []
    try {
        subscriptions = await prisma.subscription.findMany({
            where: {
                active: {
                    equals: true,
                },
            },
            orderBy: [{
                title: "asc",
            }],
        })
    }
    catch (e) {
        console.error(e)
    }
    return subscriptions
}


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


export async function CreateSubscriber(data: any) {
    let user: User | null = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    })
    let subscriptions: Subscription[] = []
    if (data.subscriptions) {
        subscriptions = await prisma.subscription.findMany({
            where: {
                slug: {
                    in: data.subscriptions,
                },
            },
        })
    }
    if (user) {
        const deleteSubscribers = await prisma.subscriber.deleteMany({
            where: {
                user: {
                    id: user.id,
                }
            }
        })
    }
    else {
        user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
            },
        })
    }
    if (subscriptions) {
        const createUserAndSubscriber = await prisma.subscriber.createMany({
            data: subscriptions.map((subscription) => {
                return {
                    userId: user!.id,
                    subscriptionId: subscription.id,
                }
            }),
        })
    }
    return true
}
