export interface IApp {
    _id: string,
    nameDefinedByUser: string,
    nameDefinedByApp: string | null,
    dateOfRegistration: string,
    dateOfAssociationByApp: string | null,
    jwtTokenForPermissionRequestsAndProfiles: string | null
}