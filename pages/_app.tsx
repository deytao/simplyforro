import "styles/globals.scss";
import { CustomFlowbiteTheme, Flowbite } from "flowbite-react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import Layout from "components/Layout";

export default function SimplyForro({ Component, pageProps }: AppProps) {
    const theme: CustomFlowbiteTheme = {
            badge: {
                root: {
                    color: {
                        party: "event-tag-party",
                        pratica: "event-tag-pratica",
                        class: "event-tag-class",
                        workshop: "event-tag-workshop",
                        festival: "event-tag-festival",
                    },
                },
            },
            dropdown: {
                floating: {
                    hidden: "hidden",
                },
            },
            footer: {
                base: "w-full bg-white shadow flex justify-between dark:bg-gray-800",
            },
    }
    return (
        <Flowbite theme={{ theme }}>
            <SessionProvider session={pageProps.session}>
                <Head>
                    <title>SimplyForró</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </SessionProvider>
        </Flowbite>
    );
}
