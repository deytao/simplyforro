import moment from "moment";
import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { unstable_getServerSession } from "next-auth/next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Role, Subscription, User } from "@prisma/client";
import { ArrowSmallRightIcon } from "@heroicons/react/24/outline";

import { GetSubscriptions } from "lib/subscription";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { subscriptionsSchema, userSchema } from "schemas/user";

interface Props {
    user: User;
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

    const subscriptions = await GetSubscriptions();

    return {
        props: {
            subscriptions: subscriptions.map((subscription) => ({
                title: subscription.title,
                description: subscription.description,
                slug: subscription.slug,
            })),
            user: {
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                roles: session.user.roles,
                subscriptions: session.user.subscriptions?.map((subscription) => subscription.slug),
            }
        },
    };
};

const Me: NextPage<Props> = ({ subscriptions, user }) => {
    const userFormOptions = {
        resolver: yupResolver(userSchema),
        defaultValues: user,
    };
    const subscriptionsFormOptions = {
        resolver: yupResolver(subscriptionsSchema),
        defaultValues: user,
    };
    const { register: registerUser, handleSubmit: handleUserSubmit, formState: userFormState } = useForm(userFormOptions);
    const { errors: userErrors } = userFormState;
    const { register: registerSubscriptions, handleSubmit: handleSubscriptionsSubmit, formState: subscriptionsFormState } = useForm(subscriptionsFormOptions);

    const router = useRouter();
    const refreshData = () => {
        router.replace(router.asPath);
    };

    async function submitUser(formData: object) {
        const user = userSchema.cast(formData);
        const { id: userId, ...userData } = user;
        const endpoint = `/api/users/${userId}`;
        const JSONdata = JSON.stringify(userData);

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

    const { errors: subscriptionsErrors } = subscriptionsFormState;
    return (
        <>
            <h1 className="text-xl md:text-6xl font-bold py-4">My</h1>

            <h2 className="text-lg md:text-4xl font-bold justify-self-start">Identity</h2>
            <form onSubmit={handleUserSubmit(submitUser)} method="POST" className="w-full">
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
            <form method="POST" className="w-full">
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

export default Me;
