import axios from "axios";

export function loadAppHolders(currentPage) {
    return axios.get(`${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/apps?page=${currentPage}`);
}

export function createNewAppHolder(nameDefinedByUser) {
    return axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/registerNewApp`,
        {nameDefinedByUser}
    );
}

export function generateAssociationTokenForAppHolder(appHolderId) {
    return axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/generateOneTimeAssociationToken`,
        {appHolderId}
    );
}

export function fetchAssociationStatus(appHolderId) {
    return new Promise((res, rej) => {
        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/apps/${appHolderId}`)
            .then((result) => {
                if (result.data && result.data.status == "success")
                    res(result.data.data.dateOfAssociationByApp != null);
                else
                    res(false);
                console.log(result);
            })
            .catch((err) => {
                res(false);
            });
    });
}

export function getAppInfo(appHolderId) {
    return new Promise((res, rej) => {
        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/apps/${appHolderId}`)
            .then((result) => {
                if (result.data)
                    res(result.data);
                else
                    res(false);
            })
            .catch((err) => {
                res(false);
            });
    })
}

export function getAllUnapprovedPermissions() {
    return new Promise((res, rej) => {
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/permissions/getUnapprovedPermissionsRequests`)
            .then((result) => {
                if (result.data)
                    res(result.data.data.permissions);
                else
                    res(false);
            })
            .catch((err) => {
                res(false);
            });
    })
}

export function getPermissionsForApp(appHolderId) {
    return new Promise((res, rej) => {
        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/permissions/getPermissionsRequestsForGivenApp/${appHolderId}`)
            .then((result) => {
                if (result.data)
                    res(result.data.permissions);
                else
                    res(false);
            })
            .catch((err) => {
                res(false);
            });
    })
}

export function grantPermission(permissionId) {
    return new Promise((res, rej) => {
        axios
            .put(
                `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/permissions/approvePermissionRequest`, {
                permissionId
            })
            .then((result) => {
                console.log(result.status);
                if (result.status != 200)
                    return rej('Permission request could not be granted');
                res('Permission was granted');
            })
            .catch((err) => {
                console.log(err.response.data);
                rej(err.response.data.message);
            });
    })
}

export function revokePermission(permissionId) {
    return new Promise((res, rej) => {
        axios
            .put(
                `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/permissions/revokePermission`, {
                permissionId
            })
            .then((result) => {
                console.log(result.status);
                if (result.status != 200)
                    return rej('Permission revoking failed');
                res('Permission was revoked');
            })
            .catch((err) => {
                console.log(err.response.data);
                rej(err.response.data.message);
            });
    });
}

// views 

export function getViewAccessesForGivenApp(appHolderId) {
    return new Promise((res, rej) => {
        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/apps/${appHolderId}/views`)
            .then((result) => {
                console.log(result);
                res(result.data.viewAccesses);
            })
            .catch((err) => {
                rej("Could not fetch view accesses from auth service");
                console.log(err);
            });
    })
}

export function getAllViewTemplates() {
    return new Promise((res, rej) => {
        axios
            .get(`${process.env.NEXT_PUBLIC_VIEW_MANAGER_ADDRESS}/viewTemplates/templates`)
            .then((result) => {
                console.log(result);
                res(result.data.viewTemplates)
                // if (result.status != 200)
                //     return rej('Permission request could not be granted');
                // res('Permission was granted');
            })
            .catch((err) => {
                rej("Could not fetch view templates from view manager component");
                console.log(err);
                // rej(err.response.data.message);
            });
    })
}

export function getSpecificViewTemplate(templateId) {
    return new Promise((res, rej) => {
        axios
            .get(`${process.env.NEXT_PUBLIC_VIEW_MANAGER_ADDRESS}/viewTemplates/templates/${templateId}`)
            .then((result) => {
                console.log(result.data);
                res(result.data)
            })
            .catch((err) => {
                rej("Could not fetch view template from view manager component");
                console.log(err);
            });
    })
}