import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import type { Provider } from 'next-auth/providers'
import { getProviders, signIn } from "next-auth/react"
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';


interface Props {
    providers: Provider[]
}

const commonClassnames = "flex-1 block"

export const getStaticProps = async () => {
    const providers = await getProviders()
    return {
        props: { providers },
    }
}

const Signin: NextPage<Props> = ({ providers }) => {
    const router = useRouter()
    const callbackUrl = router.query.callbackUrl || "/"
    return (
        <>
          <h1 className="text-xl md:text-6xl font-bold py-4 text-center">
            Signin
          </h1>

          <div className="relative md:grid md:grid-cols-2 md:gap-4">
              {Object.values(providers).map((provider) => (
                <div key={provider.name} className="md:col-span-2">
                    <div className="shadow sm:rounded-md sm:overflow-hidden">
                        {provider.type == "email" && <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-4">
                                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input type="text" name="email" data-signin-fields={`${provider.name}`} className={commonClassnames} />
                                    </div>
                                </div>
                            </div>
                        </div>}
                        {provider.type == "credentials" && <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-4">
                                    <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input type="text" name="email" data-signin-fields={`${provider.name}`} className={commonClassnames} />
                                    </div>
                                </div>
                                <div className="col-span-4">
                                    <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input type="text" name="password" data-signin-fields={`${provider.name}`} className={commonClassnames} />
                                    </div>
                                </div>
                            </div>
                        </div>}
                        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                            <button  className="btn btn-violet inline-flex justify-center"onClick={() => {
                                const fields = document.querySelectorAll(`[data-signin-fields=${provider.name}]`) as NodeListOf<HTMLInputElement>
                                const data = Object.fromEntries([...fields].map((field) => [field.name, field.value]))
                                data["callbackUrl"] = callbackUrl as string
                                signIn(provider.id, data)
                            }}>Sign in with {provider.name}</button>
                        </div>
                    </div>
                </div>
              ))}
          </div>
        </>
    )
}

export default Signin
