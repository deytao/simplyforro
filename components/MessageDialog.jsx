import { useState } from 'react'
import { Dialog } from '@headlessui/react'


const statusClasses = {
    "success": ["bg-green-100 border-green-700 text-green-700", "bg-green-700 hover:bg-green-900"],
    "error": ["bg-red-100 border-red-700 text-red-700", "bg-red-700 hover:bg-red-900"],
    "info": ["bg-teal-100 border-teal-700 text-teal-700", "bg-teal-700 hover:bg-teal-900"],
    "warning": ["bg-orange-100 border-orange-700 text-orange-700", "bg-orange-700 hover:bg-orange-900"]
}


export const MessageDialog = ({ messageDialog, setMessageDialog }) => {
  if (!(messageDialog.status in statusClasses)) {
    return <></>
  }
  const [ panelClasses, buttonClasses ] = statusClasses[messageDialog.status]
  return (
    <Dialog
      open={messageDialog.isOpen}
      onClose={() => setMessageDialog({isOpen: false})}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`border-t-4 rounded-b px-4 py-3 shadow-md w-full max-w-sm ${panelClasses}`}>
          <Dialog.Title className="font-bold">{messageDialog.title}</Dialog.Title>

          <Dialog.Description className="text-sm my-5">
            {messageDialog.message}
          </Dialog.Description>

          <button onClick={() => setMessageDialog({isOpen: false})} className={`${buttonClasses} text-white font-bold py-2 px-4 rounded`}>
            Close
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
