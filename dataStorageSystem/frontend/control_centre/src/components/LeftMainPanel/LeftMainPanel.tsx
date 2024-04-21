import React, { useEffect, useState } from 'react';
import { getAllUnapprovedPermissions } from '@/network/networkHelpers';
import SettingsModal from '../modal/modal';
import { DataAccess } from '@/network/types/DataAcessItem';
import Link from 'next/link';

const PermissionItem = params => {
    const permission: DataAccess = params.permission;

    return (
        <Link href={`/apps/${permission.app._id}#permission-${permission._id}`}>
            <div className="border border-slate-700 hover:border-slate-600 rounded p-4 mb-4">
                <h3 className="text-slate-200 font-bold">{permission.app.nameDefinedByUser}</h3>
                <p className="text-slate-600 text-sm">{permission._id}</p>
                <p className="text-slate-400">App: {permission.app.nameDefinedByApp}</p>
                <p className="text-slate-400 break-words">Profile: {permission.permission.profile}</p>
                <div className="text-slate-400 break-words">
                    <p>{permission.permission.read ? 'Read ' : ''} {permission.permission.create ? 'Create' : ''} {permission.permission.modify ? 'Modify' : ''} {permission.permission.delete ? 'Delete' : ''}</p>
                </div>
            </div>
        </Link>
    )
};

const LeftMainPanel = props => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
    const [unapprovedPermissions, setUnapprovedPermissions] = useState<DataAccess[]>([]);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    useEffect(() => {
        getAllUnapprovedPermissions()
            .then(unapprovedPermissionsResult => {
                setUnapprovedPermissions(unapprovedPermissionsResult);
                setIsLoadingPermissions(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoadingPermissions(false);
            });
    }, []);

    return (
        <>
            <SettingsModal isOpen={isModalOpen} onClose={toggleModal} />
            <div className="flex-none w-3/12 bg-gray-900 overflow-hidden h-full flex flex-col">
                <div className="flex-grow overflow-auto custom-scrollbar">
                    {isLoadingPermissions ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-slate-500">Loading permissions...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="min-h-32 w-full p-4">
                                <h1 className="text-slate-300 text-lg mb-4">Unapproved Permissions</h1>
                                {unapprovedPermissions.length > 0 ? (
                                    unapprovedPermissions.map((permission, index) => (
                                        <PermissionItem key={index} permission={permission} />
                                    ))
                                ) : (
                                    <p className="text-center text-slate-500 py-5">None</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-900">
                    <button
                        className="px-4 py-2 bg-white text-slate-950 rounded hover:bg-slate-50 transition-colors w-full my-4"
                        onClick={toggleModal}
                    >
                        Open Settings
                    </button>
                </div>
            </div>
        </>
    );
}

export default LeftMainPanel;
