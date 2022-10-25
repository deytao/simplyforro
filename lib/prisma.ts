import { PrismaClient, Subscriber as _Subscriber, Subscription as _Subscription, User } from '@prisma/client';

export let prisma: PrismaClient;

if (typeof window === 'undefined') {
    if (process.env['NODE_ENV'] === 'production') {
        prisma = new PrismaClient();
    } else {
        if (!global.prisma) {
            global.prisma = new PrismaClient({log: ["query"]});
        }
        prisma = global.prisma;
    }
}

export default prisma;

export declare type Subscriber = _Subscriber & {
  user: User
}

export declare type Subscription = _Subscription & {
  subscribers: Subscriber[]
}
