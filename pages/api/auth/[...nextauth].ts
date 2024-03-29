import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import EmailProvider, { SendVerificationRequestParams } from "next-auth/providers/email";
import type { Session, Theme, User } from "next-auth/core/types";
import type { JWT } from "next-auth/jwt/types";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { createTransport } from "nodemailer";

import prisma from "lib/prisma";

/**
 * Email HTML body
 * Insert invisible space into domains from being turned into a hyperlink by email
 * clients like Outlook and Apple mail, as this is confusing because it seems
 * like they are supposed to click on it to sign in.
 *
 * @note We don't add the email address to avoid needing to escape it, if you do, remember to sanitize it!
 */
function html(params: { url: string; host: string; theme: Theme }) {
    const { url, host, theme } = params;

    const escapedHost = host.replace(/\./g, "&#8203;.");

    const brandColor = theme.brandColor || "#346df1";
    const color = {
        background: "#f9f9f9",
        text: "#444",
        mainBackground: "#fff",
        buttonBackground: brandColor,
        buttonBorder: brandColor,
        buttonText: theme.buttonText || "#fff",
    };

    return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sign in to <strong>${escapedHost}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                rel="noreferrer"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function text({ url, host }: { url: string; host: string }) {
    return `Sign in to ${host}\n${url}\n\n`;
}

async function sendVerificationRequest(params: SendVerificationRequestParams) {
    const { identifier, url, provider, theme } = params;
    if (process.env.NODE_ENV !== "production") {
        console.log(url);
        return;
    }
    const { host } = new URL(url);
    const transport = createTransport(provider.server);
    const result = await transport.sendMail({
        to: identifier,
        from: provider.from,
        subject: "Sign in to SimplyForró",
        text: text({ url, host: "SimplyForró" }),
        html: html({ url, host: "SimplyForró", theme }),
    });
    const failed = result.rejected.concat(result.pending).filter(Boolean);
    if (failed.length) {
        throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    callbacks: {
        async session({ session, user, token }: { session: Session; user: User; token: JWT }) {
            session.user.id = user.id;
            session.user.roles = user.roles;
            session.user.subscriptions = await prisma.subscription.findMany({
                where: {
                    subscribers: {
                        some: {
                            user: {
                                id: user.id,
                            },
                        },
                    },
                },
            });
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
    providers: [
        // Passwordless / email sign in
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT as unknown as number,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
            sendVerificationRequest,
        }),
    ],
};

export default NextAuth(authOptions);
