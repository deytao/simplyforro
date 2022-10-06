import jwt from 'jsonwebtoken'
import NextAuth from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"

import prisma from 'lib/prisma';

export default NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        // Passwordless / email sign in
        CredentialsProvider({
            // The name to display on the sign in form (e.g. 'Sign in with...')
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text", placeholder: "name@email.ch" },
                password: {  label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const user = await prisma.user.findUniqueOrThrow({
                    where: {
                        email: credentials.email,
                    }
                })
                return user
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    jwt: {
        async encode({ token }) {
            return jwt.sign(token, process.env.NEXTAUTH_SECRET);
        },
        async decode({ token }) {
            return jwt.verify(token, process.env.NEXTAUTH_SECRET);
        },
    },
})
