import React, { useEffect, useState } from "react";
import Image from "next/image";
import "./modal.css"; // Make sure to create a corresponding CSS file for styling

import newAppIcon from "../../../public/images/new_app.png";
import permissionRequestsIcon from "../../../public/images/data.png";
import settingsIcon from "../../../public/images/setting.png";
import QRCodeComponent from "./components/QrCode";
import NewAppCreation from "./components/NewAppCreation";

import ViewTemplatesModule from "./components/ViewTemplatesModule";
import MultipartForm from "./components/NewViewTemplateModule";

type SettingsModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [selected, setSelected] = useState<string>("newTemplate");


    const buttonClass = (buttonId: string) =>
        `text-left py-2 px-2 font-semibold rounded-lg mx-4 mr-0 my-2 text-3xs text-white flex items-center ${buttonId === selected ? "bg-gray-600" : "text-gray-700"
        }`;

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener("keydown", handleEsc);
        }

        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="flex w-full h-full">
                    <div className="basis-2/6">
                        <div className="flex flex-col w-full">

                            <button onClick={onClose} className="flex" >
                                <div className="text-gray-400 text-4xl px-4 pb-2">&times;</div>
                            </button>

                            <button
                                className={buttonClass("new_app")}
                                onClick={() => setSelected("new_app")}
                            >
                                <Image
                                    src={newAppIcon}
                                    alt="My Icon"
                                    className="w-5 mr-2"
                                />
                                New App
                            </button>
                            <button
                                className={buttonClass("newTemplate")}
                                onClick={() => setSelected("newTemplate")}
                            >
                                <Image
                                    src={permissionRequestsIcon}
                                    alt="My Icon"
                                    className="w-5 mr-2"
                                />
                                New Template
                            </button>
                            <button
                                className={buttonClass("viewTemplates")}
                                onClick={() => setSelected("viewTemplates")}
                            >
                                <Image
                                    src={permissionRequestsIcon}
                                    alt="My Icon"
                                    className="w-5 mr-2"
                                />
                                Templates
                            </button>
                            <button
                                className={buttonClass("settings")}
                                onClick={() => setSelected("settings")}
                            >
                                <Image
                                    src={settingsIcon}
                                    alt="My Icon"
                                    className="w-5 mr-2"
                                />
                                Settings
                            </button>
                        </div>
                    </div>
                    <div className="w-full mt-2 overflow-auto p-4 custom-scrollbar">
                        {(() => {
                            switch (selected) {
                                case "new_app":
                                    return <NewAppCreation />;
                                case "newTemplate":
                                    return <MultipartForm />
                                case "viewTemplates":
                                    return <ViewTemplatesModule />
                                case "settings":
                                    return (
                                        <>
                                            <h1 className='text-lg text-center text-gray-400'>Settings</h1>
                                            <hr className="h-px mt-1 mb-6 bg-gray-200 border-0 dark:bg-gray-600" />
                                            <p>Nothing here so far</p>
                                        </>
                                    )
                                default:
                                    return (
                                        <p>
                                            Select a button to display content
                                        </p>
                                    );
                            }
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
