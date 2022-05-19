import { useState } from 'react'
import { Dialog } from '@headlessui/react'


const statusClasses = {
    "success": 'bg-green-100 border-green-500 text-green-700',
    "error": 'bg-red-100 border-red-500 text-red-700',
    "info": 'bg-teal-100 border-teal-500 text-teal-700',
    "warning": 'bg-orange-100 border-orange-500 text-orange-700'
}


export const MessageDialog = ({ messageDialog, setMessageDialog }) => {
  return (
    <Dialog
      open={messageDialog.isOpen}
      onClose={() => setMessageDialog({isOpen: false})}
      className="relative z-50"
    >
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`border-t-4 rounded-b px-4 py-3 shadow-md w-full max-w-sm ${statusClasses[messageDialog.status]}`}>
          <Dialog.Title className="font-bold">{messageDialog.title}</Dialog.Title>

          <Dialog.Description className="text-sm">
            {messageDialog.message}
          </Dialog.Description>

          <button onClick={() => setMessageDialog({isOpen: false})}>Close</button>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
