module.exports = {
    error: {
        ASSOCIATION_TOKEN_OR_NAME_MISSING: "Association token ID and name defined by app are required",
        INVALID_ASSOCIATION_TOKEN: "Invalid association token",
        APP_HOLDER_DOES_NOT_EXIST_IN_THE_SYSTEM: "App holder does not exist",

        APP_HOLDER_ALREADY_ASSOCIATED: "This app has already been associated",

        APP_NAME_CONFLICT: "App name must be unique across the whole system",

        MISSING_REQUIRED_FIELDS: "Missing required fields",
        PROFILE_NAME_MUST_BE_UNIQUE: "Profile name must be unique",
        PROFILE_DOES_NOT_EXIST: "Referenced profile does not exist",
        JSON_VALIDATION_ERROR: "Json validation error",
        SCHEMA_IS_INVALID_JSON: "Schema is invalid json",

        JWT_TOKEN_REQUIRED: "JWT token is required",
        INVALID_OR_EXPIRED_JWT_TOKEN: "Invalid or expired JWT token",

        INVALID_PERMISSIONS_REQUESTS_FORMAT: "Invalid permissions requests format",
        PERMISSION_REQUEST_MISSING_REQUIRED_FIELDS: "Each permission request must include appName and eventName"
    },
    success: {
        APP_ASSOCIATED_WITH_STORAGE_APP_HOLDER: "App successfully associated with the storage app holder",

        NEW_PROFILE_REGISTERED: "Profile registered successfully",

        PERMISSIONS_REQUESTED_SUCCESS: "Permissions requested successfully"
    }
}