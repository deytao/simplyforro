import NextAuth, { DefaultSession } from "next-auth"
import { Role } from '@prisma/client';

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            roles: Role[]
        } & DefaultSession["user"]
    }

    interface User {
        roles: Role[]
    }
}
