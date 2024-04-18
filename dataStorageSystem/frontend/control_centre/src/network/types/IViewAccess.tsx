import { Permission } from "./DataAcessItem"

export interface IViewTemplate {
    _id: string,
    templateName: string,
    sourceCodeId: string,
    metadata: {
        runtime: string
    },
    profiles: Permission[],
    createdDate: Date
}

export interface IViewInstance {
    _id: string,
    viewTemplate: IViewTemplate,
    accessTokensToProfiles: object,
    createdDate: Date
}

export interface IViewAccess {
    viewAccessId: string,
    viewAccessName: string,
    viewAccessToken: string,
    viewInstanceId: string,
    createdDate: Date,
    viewInstance: IViewInstance,
    dateOfAssociationByApp: string | null,
    jwtTokenForPermissionRequestsAndProfiles: string | null
}