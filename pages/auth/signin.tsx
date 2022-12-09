import { Button, Card, Label, TextInput } from "flowbite-react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import type { Provider } from "next-auth/providers";
import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface Props {
    providers: Provider[];
}

export const getStaticProps = async () => {
    const providers = await getProviders();
    return {
        props: { providers },
    };
};

const Signin: NextPage<Props> = ({ providers }) => {
    const router = useRouter();
    const callbackUrl = router.query.callbackUrl || "/";
    const callbackButton = (provider: Provider) => () => {
        const fields = document.querySelectorAll(
            `[data-signin-fields=${provider.name}]`,
        ) as NodeListOf<HTMLInputElement>;
        const data = Object.fromEntries([...fields].map((field) => [field.name, field.value]));
        data["callbackUrl"] = callbackUrl as string;
        signIn(provider.id, data);
    };
    return (
        <>
            <h1 className="text-xl md:text-6xl font-bold py-4 text-center">Signin</h1>

            <div className="max-w-sm">
                {Object.values(providers).map((provider) => (
                    <Card key={provider.name} className="shadow">
                        {provider.type === "email" && (
                            <>
                                <Label htmlFor="email" value="Email" />
                                <TextInput type="text" name="email" data-signin-fields={`${provider.name}`} />
                            </>
                        )}
                        {provider.type === "credentials" && (
                            <>
                                <Label htmlFor="username" value="Username" />
                                <TextInput type="text" name="email" data-signin-fields={`${provider.name}`} />
                                <Label htmlFor="password" value="Password" />
                                <TextInput type="text" name="password" data-signin-fields={`${provider.name}`} />
                            </>
                        )}
                        <Button color="purple" onClick={callbackButton(provider)} onKeyPress={callbackButton(provider)}>
                            Sign in with {provider.name}
                        </Button>
                    </Card>
                ))}
            </div>
        </>
    );
};

export default Signin;
