import { PrismaClient, Subscriber as _Subscriber, Subscription as _Subscription, User } from "@prisma/client";

export let prisma: PrismaClient;

if (typeof window === "undefined") {
    if (process.env["NODE_ENV"] === "production") {
        prisma = new PrismaClient();
    } else {
        if (!global.prisma) {
            global.prisma = new PrismaClient({ log: ["query"] });
        }
        prisma = global.prisma;
    }
    prisma.$use(async (params, next) => {
        let results = await next(params);
        if (params.action === "queryRaw") {
            results = results.map((result: any) => {
                // Change to an automatic snake_case to camelCase
                const entries = Object.entries(result).map(([key, value]) => {
                    if (["created_at", "updated_at", "image_data_url"].includes(key)) {
                        key = key.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
                    }
                    return [key, value];
                });
                return Object.fromEntries(entries);
            });
        }

        return results;
    });
}

export default prisma;

export declare type Subscriber = _Subscriber & {
    user: User;
};

export declare type Subscription = _Subscription & {
    subscribers?: Subscriber[];
};
