import { Button, Modal as _Modal } from "flowbite-react";
import { useState } from "react";

const statusClasses: { [key: string]: string[] } = {
    success: ["bg-green-100 border-green-700 text-green-700", "btn-emerald"],
    error: ["bg-red-100 border-red-700 text-red-700", "btn-red"],
    info: ["bg-teal-100 border-teal-700 text-teal-700", "bg-teal-700 hover:bg-teal-900"],
    warning: ["bg-orange-100 border-orange-700 text-orange-700", "bg-orange-700 hover:bg-orange-900"],
    neutral: ["bg-neutral-100 border-neutral-700 text-neutral-700", "btn-neutral"],
};

export interface IModal {
    isOpen: boolean;
    status?: string;
    title?: string;
    message?: any;
    content?: any;
    customButtons?: {
        title?: string;
        callback?: any;
        classes?: string;
        custom?: Element;
    }[];
}

export const Modal = ({ modal, setModal }: { modal: IModal; setModal: Function }) => {
    if (!(modal.status && Object.keys(statusClasses).includes(modal.status))) {
        return <></>;
    }
    const [panelClasses, buttonClasses] = statusClasses[modal.status];
    return (
        <_Modal show={modal.isOpen} onClose={() => setModal({ isOpen: false })}>
            <_Modal.Header>{modal.title}</_Modal.Header>
            <_Modal.Body>
                {modal.message}
                {modal.content}
            </_Modal.Body>
            <_Modal.Footer>
                <button
                    onClick={() => setModal({ isOpen: false })}
                    onKeyPress={() => setModal({ isOpen: false })}
                    className={`${buttonClasses} btn`}
                >
                    Close
                </button>
                {modal.customButtons?.map((button, idx) => {
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
            </_Modal.Footer>
        </_Modal>
    );
};
