import React, { useState } from "react";
import Image from "next/image";
import QRCodeComponent from "./QrCode";
import PuffLoader from "react-spinners/PuffLoader";
import Swal from "sweetalert2";

import SuccessImageIcon from '../../../../public/images/success.png'


import { createNewAppHolder, generateAssociationTokenForAppHolder, fetchAssociationStatus } from "../../../network/networkHelpers";

let appHolderId = null;

const NewAppCreation = () => {
    const [name, setName] = useState("");
    const [isCreatingNewAppHolder, setIsCreatingNewAppHolder] = useState(false);

    
    const [associationId, setAssociationId] = useState(null);
    const [isLoadingAssociationToken, setIsLoadingAssociationToken] = useState(false);

    const [isAppAlreadyAssociatedSuccessfully, setIsAppAlreadyAssociatedSuccessfully] = useState(false);

    const checkAssociationStatus = async () => {
        fetchAssociationStatus(appHolderId)
            .then(isAssociated => {
                setIsAppAlreadyAssociatedSuccessfully(isAssociated);
                console.log("----", isAssociated);
            })
    }

    const loadAndShowAssociationToken = async (appHolderId) => {
        generateAssociationTokenForAppHolder(appHolderId)
            .then(res => {
                setAssociationId(res.data.tokenId)
            })
            .catch((e) => {
                console.log(e);
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong when generating association token for the app"
                });
            })
    };

    const handleSubmit = () => {
        if (isCreatingNewAppHolder) return;
        setIsCreatingNewAppHolder(true);

        createNewAppHolder(name)
            .then((res) => {
                const newApps = res.data;
                appHolderId = res.data.appHolderId;

                console.log(newApps);
                Swal.fire({
                    icon: "success",
                    title: "Great!",
                    text: res.data.message,
                });
                return loadAndShowAssociationToken(appHolderId);
            })
            .catch((error) => {
                console.log(error);
                console.error(
                    "Failed to fetch apps:",
                    error.response
                );
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: error.code == "ERR_NETWORK" ? "Network error" : error.response.data.message,
                });
                // setLoading(false);
            })
            .finally(() => {
                setIsCreatingNewAppHolder(false);
            });
    };

    return (
        <div className="w-full h-full overflow-auto">
            {!associationId ? (
                <div className="flex flex-col space-y-4 max-w-xs mx-auto items-center">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name of your new app"
                        className="w-full px-4 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-0 text-white bg-gray-600"
                    />
                    <button
                        onClick={handleSubmit}
                        type="submit"
                        className="w-7/12 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50 flex flex-col items-center justify-center"
                    >
                        {!isCreatingNewAppHolder && (
                            <p>Create New App Holder</p>
                        )}
                        <PuffLoader
                            color={"#fff"}
                            loading={isCreatingNewAppHolder}
                            size={40}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </button>
                </div>
            ) : (
                <div className="w-full h-full mx-auto">
                    <h1 className="text-xl mb-2">
                        Association Token Has Been Created!
                    </h1>
                    { isAppAlreadyAssociatedSuccessfully ? (
                        <div className="flex">
                            <Image
                                src={SuccessImageIcon}
                                alt="My Icon"
                                className="w-5 h-5 mr-2"
                                />
                            
                            App is already associated! You can close this now.</div>
                    ) : (
                        <p>App is not associated yet</p>
                    )}
                    <p className="font-bold mb-4 mt-">You've got 2 options now:</p>
                    <ol>
                        <li className="mb-4">
                            <p>
                                1) Put this code into your new app{" "}
                                <span className="bg-gray-600 px-2 py-1 rounded-md text-center">
                                    {associationId}
                                </span>
                            </p>
                        </li>
                        <li className="mb-4">
                            <p>2) Scan this qr code inside your new app</p>
                            <p className="text-slate-400 text-xs">
                                (app needs to be connected to the same network)
                            </p>
                        </li>
                    </ol>
                    <div className="w-1/3 self-center mx-auto mb-4">
                        <QRCodeComponent value={`${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/app/api/associate_with_storage_app_holder/${associationId}`} />

                        <button
                            onClick={checkAssociationStatus}
                            type="submit"
                            className="w-full my-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50 flex flex-col items-center justify-center"
                        >
                        Check association
                    </button>
                    </div>
                    Network Ip address of the server: {process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}
                
                </div>
            )}
        </div>
    );
};

export default NewAppCreation;