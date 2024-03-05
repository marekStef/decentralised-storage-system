import networkRoutes from "@/constants/networkRoutes";
import persistenceManager from "@/data/PersistenceManager";

class NetworkManager {
    // GET request
    private async get<T>(endpoint: string): Promise<T> {
        console.log('endpoint', `${persistenceManager.getServerLocation()}${endpoint}`);
        const response = await fetch(`${persistenceManager.getServerLocation()}${endpoint}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }

    // POST request
    private async post(url: string, data: any) {
        return new Promise((res, rej) => {
            fetch(`${persistenceManager.getServerLocation()}${url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json().then(body => response.ok ? res(body) : rej(body)))
            .catch(error => rej(error));
        });
    }

    public async checkServerPresence(): Promise<boolean> {
        try {
            const response: { status: string } = await this.get(networkRoutes.SERVER_REACHABILITY_ROUTE);
            return response.status === 'OK';
        } catch (error) {
            console.error('Error checking server presence:', error);
            return false;
        }
    }

    public async associateWithDataStorage(associationTokenId: string, nameDefinedByApp: string): Promise<any> {
        return new Promise(async (res, rej) => {
            const data = {
                associationTokenId,
                nameDefinedByApp
            };

            this.post(networkRoutes.ASSOCIATE_WITH_DATA_STORAGE_ROUTE, data)
                .then(body => {
                    console.log('here?')
                    console.log(body.status)
                    console.log(body)
                    res(body.jwtTokenForPermissionRequestsAndProfiles);
                })
                .catch(error => {
                    console.error('Error associating with data storage:', error);
                    rej(error.message || 'Unknown error during association with data storage');
                })
        })
    }

}

export default new NetworkManager()