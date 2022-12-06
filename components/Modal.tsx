import { Button, Modal as _Modal } from "flowbite-react";
import { useState } from "react";

const statusClasses: { [key: string]: string[] } = {
    success: ["bg-green-100 border-green-700 text-green-700", "green"],
    error: ["bg-red-100 border-red-700 text-red-700", "red"],
    info: ["bg-teal-100 border-teal-700 text-teal-700", "purple"],
    warning: ["bg-orange-100 border-orange-700 text-orange-700", "yellow"],
    neutral: ["bg-neutral-100 border-neutral-700 text-neutral-700", "gray"],
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
        color?: string;
        custom?: React.ReactElement;
    }[];
}

export const Modal = ({ modal, setModal }: { modal: IModal; setModal: Function }) => {
    if (!(modal.status && Object.keys(statusClasses).includes(modal.status))) {
        return <></>;
    }
    const [panelClasses, buttonColor] = statusClasses[modal.status];
    return (
        <_Modal show={modal.isOpen} onClose={() => setModal({ isOpen: false })}>
            <_Modal.Header>{modal.title}</_Modal.Header>
            <_Modal.Body>
                {modal.message}
                {modal.content}
            </_Modal.Body>
            <_Modal.Footer>
                <Button
                    onClick={() => setModal({ isOpen: false })}
                    onKeyPress={() => setModal({ isOpen: false })}
                    color={buttonColor}
                    size="sm"
                >
                    Close
                </Button>
                {modal.customButtons?.map((button, idx) => {
                    if (button.custom) {
                        return button.custom;
                    }
                    return (
                        <Button
                            key={idx}
                            onClick={button.callback}
                            onKeyPress={button.callback}
                            color={button.color}
                            size="sm"
                        >
                            {button.title}
                        </Button>
                    );
                })}
            </_Modal.Footer>
        </_Modal>
    );
};
