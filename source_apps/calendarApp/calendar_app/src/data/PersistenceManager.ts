import localStorageConstants from "@/constants/localStorageConstants";

export enum HttpProtocolType {
    http = 'http',
    https = 'https'
}

class PersistenceManager {
    ip: string | null = null;
    port: string | null = null;
    httpMethod: string | null = null;

    jwtTokenForPermissionRequestsAndProfiles: string | null = null;
    viewInstanceAccessTokenForCalendarEventsFetching: string | null = null;

    accessTokenForEvents: string | null = null;

    isViewInstanceUsedForCalendarFetching: boolean = false;

    areWindowsOpenedAppsShown: boolean = false;
    viewInstanceAccesssTokenForWindowsAppsUniqueNamesList: string | null = null;

    public loadDataFromLocalStorage() {
        this.ip = localStorage.getItem(localStorageConstants.DATA_STORAGE_IP_ADDRESS);
        this.port = localStorage.getItem(localStorageConstants.DATA_STORAGE_PORT);
        this.httpMethod = localStorage.getItem(localStorageConstants.DATA_STORAGE_IP_ADDRESS);
        this.httpMethod = HttpProtocolType.http;

        this.jwtTokenForPermissionRequestsAndProfiles = localStorage.getItem(localStorageConstants.JWT_TOKEN_FOR_PERMISSION_REQUESTS_AND_PROFILES);
        this.viewInstanceAccessTokenForCalendarEventsFetching = localStorage.getItem(localStorageConstants.VIEW_INSTANCE_TOKEN);
        this.accessTokenForEvents = localStorage.getItem(localStorageConstants.TOKEN_FOR_EVENTS_MANIPULATION);

        const isViewInstanceUsedForCalendarFetchingStr = localStorage.getItem(localStorageConstants.IS_VIEW_INSTANCE_USED_FOR_EVENTS_FETCHING);
        this.isViewInstanceUsedForCalendarFetching = isViewInstanceUsedForCalendarFetchingStr === 'true';
        this.areWindowsOpenedAppsShown = localStorage.getItem(localStorageConstants.ARE_WINDOWS_OPENED_APPS_SHOWN) === 'true';

        this.viewInstanceAccesssTokenForWindowsAppsUniqueNamesList = localStorage.getItem(localStorageConstants.VIEW_INSTANCE_ACCESS_TOEKN_FOR_WINDOWS_OPENED_APPS_UNIQUE_NAMES_LIST);
    }

    public setServerIPAddress(ip: string) {
        this.ip = ip;
        localStorage.setItem(localStorageConstants.DATA_STORAGE_IP_ADDRESS, ip)
    }

    public setServerPort(port: string) {
        this.port = port;
        localStorage.setItem(localStorageConstants.DATA_STORAGE_PORT, port)
    }

    public setServerHttpMethod(httpMethod: HttpProtocolType) {
        this.httpMethod = httpMethod;
        localStorage.setItem(localStorageConstants.DATA_STORAGE_REQUEST_METHOD_TYPE, httpMethod)
    }

    public getServerLocation(): string {
        return `${this.httpMethod}://${this.ip}:${this.port}`
    }

    public setJwtTokenForPermissionsAndProfiles(token: string): void {
        this.jwtTokenForPermissionRequestsAndProfiles = token;
        localStorage.setItem(localStorageConstants.JWT_TOKEN_FOR_PERMISSION_REQUESTS_AND_PROFILES, token)
    }

    public getJwtTokenForPermissionsAndProfiles(): string | null {
        console.log(this.jwtTokenForPermissionRequestsAndProfiles)
        return this.jwtTokenForPermissionRequestsAndProfiles;
    }

    public setViewInstanceAccessTokenForCalendarEventsFetching(token: string): void {
        this.viewInstanceAccessTokenForCalendarEventsFetching = token;
        localStorage.setItem(localStorageConstants.VIEW_INSTANCE_TOKEN, token)
    }

    public getViewInstanceAccessTokenForCalendarEventsFetching(): string | null {
        return this.viewInstanceAccessTokenForCalendarEventsFetching;
    }

    public setAccessTokenForEvents(token: string): void {
        localStorage.setItem(localStorageConstants.TOKEN_FOR_EVENTS_MANIPULATION, token)
        this.accessTokenForEvents = token;
    }

    public getAccessTokenForEvents(): string | null {
        return this.accessTokenForEvents;
    }

    public setIsViewInstanceUsedForCalendarFetching(isUsed: boolean): void {
        localStorage.setItem(localStorageConstants.IS_VIEW_INSTANCE_USED_FOR_EVENTS_FETCHING, String(isUsed));
        this.isViewInstanceUsedForCalendarFetching = isUsed;
    }

    public getIsViewInstanceUsedForCalendarFetching(): boolean {
        return this.isViewInstanceUsedForCalendarFetching;
    }

    public setAreWindowsOpenedAppsShown(shown: boolean): void {
        localStorage.setItem(localStorageConstants.ARE_WINDOWS_OPENED_APPS_SHOWN, String(shown));
        this.isViewInstanceUsedForCalendarFetching = shown;
    }

    public getAreWindowsOpenedAppsShown(): boolean {
        return this.areWindowsOpenedAppsShown;
    }


    public getViewInstanceAccessTokenForWindowsAppsUniqueNamesList(): string | null {
        return this.viewInstanceAccesssTokenForWindowsAppsUniqueNamesList;
    }

    public setViewInstanceAccessTokenForWindowsAppsUniqueNamesList(token: string): void {
        this.viewInstanceAccesssTokenForWindowsAppsUniqueNamesList = token;
        localStorage.setItem(localStorageConstants.VIEW_INSTANCE_ACCESS_TOEKN_FOR_WINDOWS_OPENED_APPS_UNIQUE_NAMES_LIST, token);
    }

    public areAllValuesSet(): boolean {
        const areAllValuesSet = this.ip != null 
            && this.port != null 
            && this.httpMethod != null 
            && this.jwtTokenForPermissionRequestsAndProfiles != null 
            && this.viewInstanceAccessTokenForCalendarEventsFetching != null
            && this.accessTokenForEvents != null;
        return areAllValuesSet;
    }

    public resetAllValues(): void {
        this.ip = null;
        this.port = null;
        this.httpMethod = null;
        this.jwtTokenForPermissionRequestsAndProfiles = null;
        this.accessTokenForEvents = null;

        localStorage.removeItem(localStorageConstants.TOKEN_FOR_EVENTS_MANIPULATION);
        localStorage.removeItem(localStorageConstants.JWT_TOKEN_FOR_PERMISSION_REQUESTS_AND_PROFILES);
        localStorage.removeItem(localStorageConstants.DATA_STORAGE_REQUEST_METHOD_TYPE);
        localStorage.removeItem(localStorageConstants.DATA_STORAGE_PORT);
        localStorage.removeItem(localStorageConstants.DATA_STORAGE_IP_ADDRESS);
        localStorage.removeItem(localStorageConstants.IS_VIEW_INSTANCE_USED_FOR_EVENTS_FETCHING);

    }
}

export default new PersistenceManager()