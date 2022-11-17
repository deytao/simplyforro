import NextAuth, { DefaultSession } from "next-auth";
import { Role, Subscription } from "@prisma/client";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string;
            roles: Role[];
            subscriptions: Subscription[];
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        roles: Role[];
        subscriptions: Subscription[];
    }
}
