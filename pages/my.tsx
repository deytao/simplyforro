import { Button, Checkbox, Label, TextInput, Toast } from "flowbite-react";
import moment from "moment";
import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { unstable_getServerSession } from "next-auth/next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import { SchemaOf } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Role, Subscription, User } from "@prisma/client";

import { GetSubscriptions } from "lib/subscription";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { subscriptionsSchema, userSchema } from "schemas/user";

interface Props {
    user: { subscriptions: string[] } & User;
    subscriptions: Subscription[];
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session) {
        return {
            redirect: {
                destination: "/auth/signin",
                permanent: false,
            },
        };
    }

    const subscriptions = await GetSubscriptions(undefined, session.user.roles);

    return {
        props: {
            subscriptions: subscriptions.map((subscription) => ({
                title: subscription.title,
                description: subscription.description,
                slug: subscription.slug,
            })),
            user: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                roles: session.user.roles,
                subscriptions: session.user.subscriptions?.map((subscription) => subscription.slug),
            },
        },
    };
};

const My: NextPage<Props> = ({ subscriptions, user }) => {
    const userFormOptions = {
        resolver: yupResolver(userSchema),
        defaultValues: {
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles,
        },
    };
    const subscriptionsFormOptions = {
        resolver: yupResolver(subscriptionsSchema),
        defaultValues: {
            subscriptions: user.subscriptions,
        },
    };
    const {
        register: registerUser,
        handleSubmit: handleUserSubmit,
        formState: userFormState,
    } = useForm(userFormOptions);
    const { errors: userErrors } = userFormState;
    const {
        register: registerSubscriptions,
        handleSubmit: handleSubscriptionsSubmit,
        formState: subscriptionsFormState,
    } = useForm(subscriptionsFormOptions);
    const { errors: subscriptionsErrors } = subscriptionsFormState;

    const router = useRouter();
    const refreshData = () => {
        router.replace(router.asPath);
    };

    const [formIsSuccess, setFormIsSuccess] = useState(false);
    async function submitForm(formData: object, e: any) {
        const schemas: { [key: string]: any } = {
            user: userSchema,
            subscriptions: subscriptionsSchema,
        };
        const target = e.target as HTMLFormElement;
        const castedData = schemas[target.dataset.schema!].cast(formData);
        const { id: userId, ...data } = castedData;
        const endpoint = target.action;
        const JSONdata = JSON.stringify(data);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSONdata,
        };
        await fetch(endpoint, options)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("An error occured, please try again later.");
                }
                return response.json();
            })
            .then((data) => {
                setFormIsSuccess(true);
                setTimeout(() => setFormIsSuccess(false), 2000);
            })
            .catch((error) => {
                console.log("bad");
            });
        return false;
    }

    return (
        <>
            <Toast duration={100} className={`absolute z-50 top-10 ${formIsSuccess ? "" : "hidden"}`}>
                <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                    <HiOutlineCheckCircle className="h-5 w-5 -mt-1 inline" />
                </div>
                <div className="ml-3 text-sm font-normal">Informations updated</div>
                <Toast.Toggle />
            </Toast>

            <h1 className="text-xl md:text-6xl font-bold py-4">My</h1>

            <div className="w-full pr-2 pl-2">
                <h2 className="text-lg md:text-4xl font-bold justify-self-start my-3">Identity</h2>
                <form
                    method="POST"
                    onSubmit={handleUserSubmit(submitForm)}
                    action={`/api/users/${user.id}`}
                    data-schema="user"
                    className="flex flex-col gap-2"
                >
                    <input type="hidden" {...registerUser("id")} id="user-id" />
                    <div>
                        <div className="mb-1">
                            <Label htmlFor="user-name" value="Name" />
                        </div>
                        <TextInput
                            {...registerUser("name")}
                            id="user-name"
                            className={`${userErrors.name ? "border-red-500" : ""}`}
                        />
                    </div>
                    <div>
                        <div className="mb-1">
                            <Label htmlFor="user-email" value="Email" />
                        </div>
                        <TextInput
                            {...registerUser("email")}
                            id="user-email"
                            className={`${userErrors.email ? "border-red-500" : ""}`}
                        />
                    </div>
                    {user.roles.includes(Role.admin) && (
                        <fieldset id="roles">
                            <legend className="text-base font-medium text-gray-900 dark:text-white">Roles</legend>
                            <p className="text-red-500 text-xs italic">{userErrors.roles?.message}</p>
                            <div className="flex flex-col gap-2">
                                {Object.keys(Role).map((role: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`roles-${role}`}
                                            {...registerUser("roles")}
                                            value={role}
                                            className={userErrors.roles ? "border-red-500" : ""}
                                        />
                                        <Label htmlFor={`roles-${role}`} className="capitalize" value={role} />
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                    )}
                    <Button type="submit" color="purple" className="my-5">
                        Save
                    </Button>
                </form>
            </div>

            <div className="w-full pr-2 pl-2">
                <h2 className="text-lg md:text-4xl font-bold justify-self-start mb-3">Subscriptions</h2>
                <form
                    method="POST"
                    onSubmit={handleSubscriptionsSubmit(submitForm)}
                    action={`/api/users/${user.id}/subscriptions`}
                    data-schema="subscriptions"
                    className="flex flex-col gap-2"
                >
                    <input type="hidden" {...registerSubscriptions("id")} id="user-id" />
                    <fieldset>
                        <p className="text-red-500 text-xs italic">{subscriptionsErrors.subscriptions?.message}</p>
                        <div className="flex flex-col gap-2">
                            {subscriptions.map((subscription: Subscription, idx: number) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`subscriptions-${subscription.slug}`}
                                        {...registerSubscriptions("subscriptions")}
                                        value={subscription.slug}
                                        className={subscriptionsErrors.subscriptions ? "border-red-500" : ""}
                                    />
                                    <div className="flex flex-col">
                                        <Label htmlFor={`subscriptions-${subscription.slug}`} className="capitalize">
                                            {subscription.title}
                                            <p className="text-xs font-normal text-gray-500 dark:text-gray-300 normal-case">
                                                {subscription.description}
                                            </p>
                                        </Label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </fieldset>
                    <Button type="submit" color="purple">
                        Save
                    </Button>
                </form>
            </div>
        </>
    );
};

export default My;
