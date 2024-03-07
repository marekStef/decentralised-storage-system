export const networkRoutes = {
    SERVER_REACHABILITY_ROUTE: '/status_info/checks/check_data_storage_presence',
    ASSOCIATE_WITH_DATA_STORAGE_ROUTE: '/app/api/associate_with_storage_app_holder',
    REGISTER_NEW_PROFILE_ROUTE: '/app/api/register_new_profile',
    
    REQUEST_PERMISSIONS_ROUTE: '/app/api/request_new_permissions',
    CHECK_ACCESS_TOKEN_FOR_REQUESTED_PERMISSION: '/app/api/checkAccessTokenStatus',

    UPLOAD_NEW_EVENTS_ROUTE: '/app/api/upload_new_events'
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