import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import '../../app/globals.css'

import { getAppInfo, getPermissionsForApp, getViewAccessesForGivenApp, grantPermission, revokePermission } from '../../network/networkHelpers';
import { showError, showSuccess } from '@/helpers/alerts';
import CopyToClipboardText from '@/components/copyToClipboard/CopyToClipboardText';
import Link from 'next/link';
import { DataAccess } from '@/network/types/DataAcessItem';
import { IViewAccess } from '@/network/types/IViewAccess';

function AppPage() {
    const router = useRouter();
    const appId: string = Array.isArray(router.query.appId) ? router.query.appId[0] : router.query.appId;

    const [isLoadingAppInfo, setIsLoadingAppInfo] = useState<boolean>(true);
    const [appInfo, setAppInfo] = useState(null);

    const [isLoadingAppPermissions, setIsLoadingAppPermissions] = useState<boolean>(true);
    const [appPermissions, setAppPermissions] = useState<DataAccess[] | null>(null);

    const [isLoadingViewAccesses, setIsLoadingViewAccesses] = useState<boolean>(true);
    const [viewAccesses, setViewAccesses] = useState<IViewAccess[]>([]);

    const loadInitialData = (appId: string) => {
        getAppInfo(appId)
            .then((appInfoRes) => {
                console.log(appInfoRes);
                setAppInfo(appInfoRes);
            })
            .catch(err => {
                console.log(err);
                showError("Failed to fetch the application info - check whether the storage system is running", false);
            })
            .finally(() => {
                setIsLoadingAppInfo(false);
            });

        getPermissionsForApp(appId)
            .then((appPermissionsRes) => {
                console.log(appPermissionsRes);
                setAppPermissions(appPermissionsRes);
            })
            .catch(err => {
                console.log(err);
                showError("Failed to fetch permissions for a given application - check whether the storage system is running", false);
            })
            .finally(() => {
                setIsLoadingAppPermissions(false);
            });

        getViewAccessesForGivenApp(appId)
            .then(viewAccessesResult => {
                console.log('----', viewAccessesResult);
                setViewAccesses(viewAccessesResult);
            })
            .catch(err => {
                console.log(err);
                showError(err);
            })
            .finally(() => {
                setIsLoadingViewAccesses(false);
            })
    }

    const approvePermissionRequestHandler = permissionId => {
        console.log(permissionId);
        grantPermission(permissionId)
            .then((message) => {
                showSuccess(message);
            })
            .catch((message) => {
                showError(message);
            })
            .finally(() => {
                loadInitialData(appId);
            })
    }

    const revokePermissionHandler = permissionId => {
        revokePermission(permissionId)
            .then((message) => {
                showSuccess(message);
            })
            .catch((message) => {
                showError(message);
            })
            .finally(() => {
                loadInitialData(appId);
            });
    }

    useEffect(() => {
        if (!appId) return;
        loadInitialData(appId);
    }, [appId])

    useEffect(() => {
        if (!isLoadingAppPermissions) {
          const hash = window.location.hash;
          if (hash) {
            const id = hash.replace('#', '');
            const element = document.getElementById(id);
            console.log('->', element);
            if (element) {
              element.scrollIntoView();
            }
          }
        }
      }, [isLoadingAppPermissions]);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-semibold my-4">App Info</h2>
            {isLoadingAppInfo ? (
                <p>Loading...</p>
            ) : (
                appInfo && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{appInfo.data.nameDefinedByUser}</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">app holder id: <span className='bg-gray-100 py-1 px-2 rounded-lg'>{appInfo.data._id}</span></p>
                        </div>
                        <div className="border-t border-gray-200">
                            <dl>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">App Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{appInfo.data.nameDefinedByApp}</dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Date of Association</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(appInfo.data.dateOfAssociationByApp).toLocaleString()}</dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(appInfo.data.dateOfRegistration).toLocaleString()}</dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">jwtTokenForPermissionRequestsAndProfiles</dt>
                                    {/* <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(appInfo.data.dateOfRegistration).toLocaleString()}</dd> */}
                                    <CopyToClipboardText value={appInfo.data.jwtTokenForPermissionRequestsAndProfiles} className="sm:col-span-2 text-sm" />
                                </div>
                            </dl>
                        </div>
                    </div>
                )
            )}

            <h2 className="text-2xl font-semibold my-4">Permissions</h2>
            {isLoadingAppPermissions ? (
                <p>Loading permissions...</p>
            ) : (
                appPermissions && appPermissions.length > 0 ? (
                    appPermissions.map((permission: DataAccess) => (
                        <div key={`permission-${permission._id}`} id={`permission-${permission._id}`} className="bg-white shadow overflow-hidden sm:rounded-lg mb-4">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Permission</h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">{permission._id}</p>
                            </div>
                            <div className="border-t border-gray-200">
                                <dl>
                                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Optional Message</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                            {permission.requestMessage || "-"}
                                        </dd>
                                    </div>

                                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Permission Profile</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{permission.permission.profile}</dd>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Permissions Granted</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                            <div>Read: {permission.permission.read ? 'Yes' : 'No'}</div>
                                            <div>Create: {permission.permission.create ? 'Yes' : 'No'}</div>
                                            <div>Modify: {permission.permission.modify ? 'Yes' : 'No'}</div>
                                            <div>Delete: {permission.permission.delete ? 'Yes' : 'No'}</div>
                                        </dd>
                                    </div>
                                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Created Date</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(permission.createdDate).toLocaleString()}</dd>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Approved Date</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                            {permission.approvedDate ? new Date(permission.approvedDate).toLocaleString() : 'N/A'}
                                        </dd>
                                    </div>
                                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Revoked Date</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                            {permission.revokedDate ? new Date(permission.revokedDate).toLocaleString() : 'N/A'}
                                        </dd>
                                    </div>

                                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Active</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                            {permission.isActive ? 'Yes' : 'No'}
                                            {permission.revokedDate == null && (
                                                <button
                                                    onClick={() => {
                                                        if (permission.isActive)
                                                            revokePermissionHandler(permission._id);
                                                        else
                                                            approvePermissionRequestHandler(permission._id);
                                                    }}
                                                    className={`ml-4 text-white font-bold py-2 px-4 rounded ${permission.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                                >
                                                   {permission.isActive ? 'Revoke' : 'Approve'} 
                                                </button>
                                            )}
                                            </dd>
                                    </div>
                                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Expiration Date</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                            {permission.expirationDate ? new Date(permission.expirationDate).toLocaleString() : 'N/A'}
                                        </dd>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Access Token</dt>
                                        {/* <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-words">{permission.accessToken}</dd> */}
                                        <CopyToClipboardText value={permission.accessToken} className="sm:col-span-2 text-sm" />
                                    </div>
                                </dl>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No permissions found.</p>
                )
            )}

            <h2 className="text-2xl font-semibold my-4">View Instances Accesses</h2>

            {isLoadingViewAccesses ? (
                <p>Loading view accesses...</p>
            ) : (
                viewAccesses.length > 0 ? (
                    viewAccesses.map((viewAccess: IViewAccess) => (
                        <div key={viewAccess.viewAccessId} className="bg-white shadow overflow-hidden sm:rounded-lg mb-4">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">View Instance Access</h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">{viewAccess.viewAccessId}</p>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                    View Access Name: <p className='font-bold text-gray-900'>{viewAccess.viewAccessName || '[no name]'}</p></p>
                            </div>
                            <div className="border-t border-gray-200">
                                <dl>
                                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Created Date</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(viewAccess.createdDate).toLocaleString()}</dd>
                                    </div>
                                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">View Template ID</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                            {viewAccess.viewInstance.viewTemplate._id}
                                            <Link href={`/viewTemplates/${viewAccess.viewInstance.viewTemplate._id}`} className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                                See Details

                                            </Link>
                                        </dd>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">View Access Token</dt>
                                        {/* <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-words">{permission.accessToken}</dd> */}
                                        <CopyToClipboardText value={viewAccess.viewAccessToken} className="sm:col-span-2 text-sm" />
                                    </div>
                                </dl>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No View Accesses</p>
                )
            )}
        </div>
    );
}

export default AppPage;
