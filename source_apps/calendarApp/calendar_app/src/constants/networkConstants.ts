export const networkRoutes = {
    SERVER_REACHABILITY_ROUTE: '/status_info/checks/check_auth_service_presence',
    ASSOCIATE_WITH_DATA_STORAGE_ROUTE: '/app/api/associateWithStorageAppHolder',
    REGISTER_NEW_PROFILE_ROUTE: '/app/api/registerNewProfile',
    
    REQUEST_PERMISSIONS_ROUTE: '/app/api/requestNewPermission',
    CHECK_ACCESS_TOKEN_FOR_REQUESTED_PERMISSION: '/app/api/checkAccessTokenStatus',

    UPLOAD_NEW_EVENTS_ROUTE: '/app/api/uploadNewEvents',
    GET_ALL_EVENTS_FOR_GIVEN_ACCESS_TOKEN: '/app/api/getAllEventsForGivenAccessToken',

    MODIFY_GIVEN_EVENT: '/app/api/modifyEvent',
    DELETE_GIVEN_EVENT: '/app/api/deleteEvent',
}

export const networkStatusCodes = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
}