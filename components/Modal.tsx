import { Button, Modal as Modal_ } from "flowbite-react";
import { useState } from "react";

const statusClasses: { [key: string]: string[] } = {
    success: ["bg-green-100 border-green-700 text-green-700", "success"],
    error: ["bg-red-100 border-red-700 text-red-700", "failure"],
    info: ["bg-teal-100 border-teal-700 text-teal-700", "purple"],
    warning: ["bg-orange-100 border-orange-700 text-orange-700", "warning"],
    neutral: ["bg-neutral-100 border-neutral-700 text-neutral-700", "light"],
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
        <Modal_ show={modal.isOpen} onClose={() => setModal({ isOpen: false })}>
            <Modal_.Header>{modal.title}</Modal_.Header>
            <Modal_.Body>
                {modal.message}
                {modal.content}
            </Modal_.Body>
            <Modal_.Footer className="flex">
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
            </Modal_.Footer>
        </Modal_>
    );
};
