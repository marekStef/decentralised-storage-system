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
