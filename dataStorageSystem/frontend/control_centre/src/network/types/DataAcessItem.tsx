import { IApp } from "./IApp";

export interface Permission {
    profile: string;
    read: boolean;
    create: boolean;
    modify: boolean;
    delete: boolean;
}

export interface DataAccess {
    accessToken: string;
    app: IApp;
    approvedDate: string | null;
    createdDate: string;
    expirationDate: string | null;
    isActive: boolean;
    requestMessage: string;
    permission: Permission;
    revokedDate: string | null;
    _id: string;
}