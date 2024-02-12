import React, { useEffect, useState } from "react";
import Image from "next/image";
import "./modal.css"; // Make sure to create a corresponding CSS file for styling

import newAppIcon from "../../../public/images/new_app.png";
import permissionRequestsIcon from "../../../public/images/data.png";
import settingsIcon from "../../../public/images/setting.png";
import QRCodeComponent from "./components/QrCode";
import NewAppCreation from "./components/NewAppCreation";

type SettingsModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [selected, setSelected] = useState<string>("new_app");


    const buttonClass = (buttonId: string) =>
        `text-left py-2 px-2 font-semibold rounded-lg mx-4 my-2 text-3xs text-white flex items-center ${
            buttonId === selected ? "bg-gray-600" : "text-gray-700"
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
                <header className="modal-header m-4">
                    <h1 className="text-xl text-gray-400">Control Centre</h1>
                    <button onClick={onClose} className="close-button">
                        <p className="text-gray-400 text-3xl">&times;</p>
                    </button>
                </header>

                <div className="flex w-full">
                    <div className="basis-1/4 ">
                        <div className="flex flex-col w-full">
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
                                className={buttonClass("permissions")}
                                onClick={() => setSelected("permissions")}
                            >
                                <Image
                                    src={permissionRequestsIcon}
                                    alt="My Icon"
                                    className="w-5 mr-2"
                                />
                                Permissions
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
                    <div className="w-full h-full mr-4 mt-2">
                        {(() => {
                            switch (selected) {
                                case "new_app":
                                    return <NewAppCreation />;
                                case "permissions":
                                    return <p>Permissions (todo)</p>;
                                case "settings":
                                    return <p>Settings (todo)</p>;
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
