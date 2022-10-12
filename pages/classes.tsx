import type { NextPage } from 'next'
import { useSession, signIn } from "next-auth/react"
import { Event, Role } from '@prisma/client';
import { useEffect, useState } from 'react'

import { MessageDialog } from 'components/MessageDialog'


const Classes: NextPage = () => {
    const { data: session, status } = useSession({required: true})
    const [ messageDialogState, setMessageDialogState ] = useState({
        isOpen: false,
        status: "",
        title: "",
        message: "",
    });
    if (status === "loading") {
        return <>Loading</>
    }
    return (
      <>
        <h1 className="text-xl md:text-6xl font-bold py-4 text-center">Pendings</h1>

        <MessageDialog messageDialog={messageDialogState} setMessageDialog={setMessageDialogState} />

        <table className="w-full table-fixed">
            <thead>
                <tr>
                    <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-left">Title</th>
                    <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-left">Date</th>
                    <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-left">Categories</th>
                    <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-left">Location</th>
                    <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-left">Url</th>
                    <th className="border-b font-medium p-4 pl-8 pt-0 pb-3 text-left flex gap-x-px">
                        <button type="button" className="basis-1/2 btn btn-emerald" data-event-action="validate" data-event-all>Validate all</button>
                        <button type="button" className="basis-1/2 btn btn-red" data-event-action="reject" data-event-all>Reject all</button>
                    </th>
                </tr>
            </thead>
        </table>
      </>
  )
}

export default Classes
