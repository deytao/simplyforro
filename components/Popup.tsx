import { Button, Modal } from "flowbite-react";
import { useState } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

export interface IPopup {
    isOpen: boolean;
    message?: string;
    buttons?: {
        title: string;
        callback?: any;
        color?: string;
    }[];
}

export const Popup = ({ popup, setPopup }: { popup: IPopup; setPopup: Function }) => {
    return (
        <Modal show={popup.isOpen} onClose={() => setPopup({ isOpen: false })}>
            <Modal.Header />
            <Modal.Body>
                <ExclamationCircleIcon className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">{popup.message}</h3>
                <div className="flex justify-center gap-4">
                    {popup.buttons?.map((button, idx) => {
                        const callback = () => {
                            if (button.callback) {
                                button.callback();
                            }
                            setPopup({ isOpen: false });
                        };
                        return (
                            <Button key={idx} onClick={callback} onKeyPress={callback} color={button.color}>
                                {button.title}
                            </Button>
                        );
                    })}
                </div>
            </Modal.Body>
        </Modal>
    );
};
