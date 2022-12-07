import "styles/globals.scss";
import { Flowbite } from "flowbite-react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import Layout from "components/Layout";

export default function SimplyForro({ Component, pageProps }: AppProps) {
    return (
        <Flowbite
            theme={{
                theme: {
                    dropdown: {
                        floating: {
                            hidden: "hidden",
                        },
                    },
                },
            }}
        >
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
