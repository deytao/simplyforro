import { Button, Modal } from "flowbite-react";
import { useState } from "react";

const statusClasses = {
    success: ["bg-green-100 border-green-700 text-green-700", "btn-emerald"],
    error: ["bg-red-100 border-red-700 text-red-700", "btn-red"],
    info: ["bg-teal-100 border-teal-700 text-teal-700", "bg-teal-700 hover:bg-teal-900"],
    warning: ["bg-orange-100 border-orange-700 text-orange-700", "bg-orange-700 hover:bg-orange-900"],
    neutral: ["bg-neutral-100 border-neutral-700 text-neutral-700", "btn-neutral"],
};

export const MessageDialog = ({ messageDialog, setMessageDialog }) => {
    if (!(messageDialog.status in statusClasses)) {
        return <></>;
    }
    const [panelClasses, buttonClasses] = statusClasses[messageDialog.status];
    return (
        <Modal show={messageDialog.isOpen} onClose={() => setMessageDialog({ isOpen: false })}>
            <Modal.Header>{messageDialog.title}</Modal.Header>
            <Modal.Body>
                {messageDialog.message && <div className="text-sm my-5">{messageDialog.message}</div>}

                {messageDialog.content && <div className="my-5">{messageDialog.content}</div>}
            </Modal.Body>
            <Modal.Footer>
                <button
                    onClick={() => setMessageDialog({ isOpen: false })}
                    onKeyPress={() => setMessageDialog({ isOpen: false })}
                    className={`${buttonClasses} btn`}
                >
                    Close
                </button>
                {messageDialog.customButtons?.map((button, idx) => {
                    if (button.custom) {
                        return button.custom;
                    }
                    return (
                        <button
                            key={idx}
                            onClick={button.callback}
                            onKeyPress={button.callback}
                            className={`${button.classes} ml-1`}
                        >
                            {button.title}
                        </button>
                    );
                })}
            </Modal.Footer>
        </Modal>
    );
};
