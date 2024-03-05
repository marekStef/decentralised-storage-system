import localStorageConstants from "@/constants/localStorageConstants";

export enum HttpProtocolType {
    http = 'http',
    https = 'https'
}

class PersistenceManager {
    ip: string | null = null;
    port: string | null = null;
    httpMethod: string | null = null;

    public loadDataFromLocalStorage() {
        this.ip = localStorage.getItem(localStorageConstants.DATA_SOTRAGE_IP_ADDRESS)
        this.port = localStorage.getItem(localStorageConstants.DATA_STORAGE_PORT)
        this.httpMethod = localStorage.getItem(localStorageConstants.DATA_SOTRAGE_IP_ADDRESS)
        this.httpMethod = HttpProtocolType.http
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

}

export default new PersistenceManager()