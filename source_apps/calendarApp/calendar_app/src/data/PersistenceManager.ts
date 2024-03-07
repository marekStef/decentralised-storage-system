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

    accessTokenForEvents: string | null = null;

    public loadDataFromLocalStorage() {
        this.ip = localStorage.getItem(localStorageConstants.DATA_SOTRAGE_IP_ADDRESS);
        this.port = localStorage.getItem(localStorageConstants.DATA_STORAGE_PORT);
        this.httpMethod = localStorage.getItem(localStorageConstants.DATA_SOTRAGE_IP_ADDRESS);
        this.httpMethod = HttpProtocolType.http;

        this.jwtTokenForPermissionRequestsAndProfiles = localStorage.getItem(localStorageConstants.JWT_TOKEN_FOR_PERMISSION_REQUESTS_AND_PROFILES);
        this.accessTokenForEvents = localStorage.getItem(localStorageConstants.TOKEN_FOR_EVENTS_MANIPULATION);
    }

    public setServerIPAddress(ip: string) {
        this.ip = ip;
        localStorage.setItem(localStorageConstants.DATA_SOTRAGE_IP_ADDRESS, ip)
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

    public setAccessTokenForEvents(token: string): void {
        localStorage.setItem(localStorageConstants.TOKEN_FOR_EVENTS_MANIPULATION, token)
        this.accessTokenForEvents = token;
    }

    public getAccessTokenForEvents(): string | null {
        return this.accessTokenForEvents;
    }

    public areAllValuesSet(): boolean {
        const areAllValuesSet = this.ip != null 
            && this.port != null 
            && this.httpMethod != null 
            && this.jwtTokenForPermissionRequestsAndProfiles != null 
            && this.accessTokenForEvents != null;
        return areAllValuesSet;
    }

    public resetAllValues(): void {
        this.ip = null;
        this.port = null;
        this.httpMethod = null;
        this.jwtTokenForPermissionRequestsAndProfiles = null;
        this.accessTokenForEvents = null;

        // localStorage.removeItem(localStorageConstants.TOKEN_FOR_EVENTS_MANIPULATION)
        // localStorage.removeItem(localStorageConstants.JWT_TOKEN_FOR_PERMISSION_REQUESTS_AND_PROFILES)
        // localStorage.removeItem(localStorageConstants.DATA_STORAGE_REQUEST_METHOD_TYPE)
        localStorage.removeItem(localStorageConstants.DATA_STORAGE_PORT)
        // localStorage.removeItem(localStorageConstants.DATA_SOTRAGE_IP_ADDRESS)

    }
}

export default new PersistenceManager()