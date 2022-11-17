import moment from "moment";
import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { unstable_getServerSession } from "next-auth/next";
import { useForm } from "react-hook-form";
import { SchemaOf } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Role, Subscription, User } from "@prisma/client";
import { ArrowSmallRightIcon } from "@heroicons/react/24/outline";

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
                destination: '/auth/signin',
                permanent: false,
            }
        }
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
            }
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
            subscriptions: user.subscriptions
        },
    };
    const { register: registerUser, handleSubmit: handleUserSubmit, formState: userFormState } = useForm(userFormOptions);
    const { errors: userErrors } = userFormState;
    const { register: registerSubscriptions, handleSubmit: handleSubscriptionsSubmit, formState: subscriptionsFormState } = useForm(subscriptionsFormOptions);
    const { errors: subscriptionsErrors } = subscriptionsFormState;

    const router = useRouter();
    const refreshData = () => {
        router.replace(router.asPath);
    };

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
                console.log("good")
            })
            .catch((error) => {
                console.log("bad")
            });
        return false;
    }

    return (
        <>
            <h1 className="text-xl md:text-6xl font-bold py-4">My</h1>

            <h2 className="text-lg md:text-4xl font-bold justify-self-start">Identity</h2>
            <form method="POST" onSubmit={handleUserSubmit(submitForm)} className="w-full" action={`/api/users/${user.id}`} data-schema="user">
                <input type="hidden" {...registerUser("id")} id="user-id" />
                <div className="grid grid-cols-2 gap-2 px-4 py-5">
                    <div className="col-span-2">
                        <label
                            htmlFor="event-title"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Name
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                                type="text"
                                {...registerUser("name")}
                                id="user-name"
                                className={`${userErrors.name ? "border-red-500" : ""}`}
                            />
                        </div>
                    </div>
                    <div className="col-span-2">
                        <label
                            htmlFor="event-email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                                type="text"
                                {...registerUser("email")}
                                id="user-email"
                                className={`${userErrors.email ? "border-red-500" : ""}`}
                            />
                        </div>
                    </div>
                    {user.roles.includes(Role.admin) && <fieldset>
                        <legend className="text-base font-medium text-gray-900">Roles</legend>
                        <p className="text-red-500 text-xs italic">{userErrors.roles?.message}</p>
                        <div className="mt-4 space-y-4">
                            {Object.keys(Role).map((role: string, idx: number) => (
                                <div key={idx} className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            id={`roles-${role}`}
                                            {...registerUser("roles")}
                                            value={role}
                                            className={userErrors.roles ? "border-red-500" : ""}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label
                                            htmlFor={`roles-${role}`}
                                            className="font-medium text-gray-700 capitalize"
                                        >
                                            {role}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </fieldset>}
                </div>
                <div className="px-4 py-3 bg-gray-100 text-right sm:px-6">
                    <button type="submit" className="btn btn-violet inline-flex justify-center">Save</button>
                </div>
            </form>

            <h2 className="text-lg md:text-4xl font-bold justify-self-start">Subscriptions</h2>
            <form method="POST" onSubmit={handleSubscriptionsSubmit(submitForm)} className="w-full" action={`/api/users/${user.id}/subscriptions`} data-schema="subscriptions">
                <input type="hidden" {...registerSubscriptions("id")} id="user-id" />
                <div className="grid grid-cols-2 gap-2 px-4 py-5">
                    <fieldset>
                        <legend className="text-base font-medium text-gray-900">Roles</legend>
                        <p className="text-red-500 text-xs italic">{subscriptionsErrors.subscriptions?.message}</p>
                        <div className="mt-4 space-y-4">
                            {subscriptions.map((subscription: Subscription, idx: number) => (
                                <div key={idx} className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            id={`subscriptions-${subscription.slug}`}
                                            {...registerSubscriptions("subscriptions")}
                                            value={subscription.slug}
                                            className={subscriptionsErrors.subscriptions ? "border-red-500" : ""}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label
                                            htmlFor={`subscriptions-${subscription.slug}`}
                                            className="font-medium text-gray-700"
                                        >
                                            {subscription.title}
                                            <p className="text-gray-500 font-normal">
                                                {subscription.description}
                                            </p>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </fieldset>
                </div>
                <div className="px-4 py-3 bg-gray-100 text-right sm:px-6">
                    <button type="submit" className="btn btn-violet inline-flex justify-center">Save</button>
                </div>
            </form>
        </>
    );
};

export default My;
