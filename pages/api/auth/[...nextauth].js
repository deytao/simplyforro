import NextAuth from 'next-auth'
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter"

import prisma from 'lib/prisma';

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    callbacks: {
        async session({ session, user, token }) {
            session.user.roles = user.roles
            return session
        },
    },
    providers: [
        // Passwordless / email sign in
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD
                }
            },
            from: process.env.EMAIL_FROM
        }),
    ],
}

export default NextAuth(authOptions)
