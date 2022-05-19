import { useState } from 'react'
import { Dialog } from '@headlessui/react'

export const MessageDialog = ({ messageDialog, setMessageDialog }) => {
  return (
    <Dialog
      open={messageDialog.isOpen}
      onClose={() => setMessageDialog({isOpen: false})}
      className="relative z-50"
    >
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md w-full max-w-sm">
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
