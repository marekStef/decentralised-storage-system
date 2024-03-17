import axios from "axios";

export function loadAppHolders(currentPage) {
    return axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/apps?page=${currentPage}`
    );
}

export function createNewAppHolder(nameDefinedByUser) {
    return axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/register_new_app`,
        { nameDefinedByUser }
    );
}

export function generateAssociationTokenForAppHolder(appHolderId) {
    return axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/generate_one_time_association_token`,
        { appHolderId }
    );
}

export function fetchAssociationStatus(appHolderId) {
    return new Promise((res, rej) => {
        axios
            .get(
                `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/apps/${appHolderId}`
            )
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
            .get(
                `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/apps/${appHolderId}`
            )
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

export function getPermissionsForApp(appHolderId) {
    return new Promise((res, rej) => {
        axios
            .get(
                `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/permissions/get_unapproved_permissions_requests/${appHolderId}`
            )
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
                `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URI}/admin/api/permissions/approve_permission_request`, {
                    permissionId
                }
            )
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