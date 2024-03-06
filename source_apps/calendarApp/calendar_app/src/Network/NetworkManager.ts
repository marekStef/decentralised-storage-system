import appConstants from "@/constants/appConstants";
import dataStorageConstants from "@/constants/dataStorageConstants";
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
            .then(response => response.json().then(body => response.ok ? res({...body, status: response.status}) : rej({...body, status: response.status})))
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

    private async getSchemaForGivenProfileName(profileName: string): Promise<string> {
        const response = await fetch(`/profilesForDataStorage/${profileName}.json`);
        const schema = await response.json();
        return schema;
    }

    public async createNewCalendarEventProfileInDataStorage(): Promise<any> {
        const jwtTokenForPermissionRequestsAndProfiles = persistenceManager.getJwtTokenForPermissionsAndProfiles()
        console.log('---', jwtTokenForPermissionRequestsAndProfiles)
        
        const rootProfile = dataStorageConstants.DATA_STORAGE_ROOT_PROFILE;
        let schema: string = '';

        return new Promise(async (res, rej) => {
            if (jwtTokenForPermissionRequestsAndProfiles == null)
                rej("Your app does not have token saved for this operation");

            try {
                schema = await this.getSchemaForGivenProfileName(appConstants.calendarEventProfileName)
                console.log(schema)
            }
            catch (e) {
                rej("Couldn't find a profile schema for sending to DataStorage. Check whether the Calendar App is valid.");
            }

            const data = {
                jwtTokenForPermissionRequestsAndProfiles,
                payload: {
                    profile_name: appConstants.calendarEventProfileName,
                    json_schema: schema
                },
                metadata: {
                    createdDate: new Date().toISOString(),
                    profile: rootProfile
                }
            };

            this.post(networkRoutes.REGISTER_NEW_PROFILE_ROUTE, data)
                .then(response => {
                    if (response.status === 201) {
                        console.log('Success:', response.message);
                        res(response.message);
                    } else {
                        
                        console.error('Failure:', response);
                        rej(response.message);
                    }
                })
                .catch(error => {
                    console.error('error:', error);
                    rej(error.message || 'Network error during new profile creation');
                });
        });
    }

}

export default new NetworkManager()