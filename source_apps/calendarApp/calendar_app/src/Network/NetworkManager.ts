import appConstants from "@/constants/appConstants";
import {networkRoutes, networkStatusCodes} from "@/constants/networkConstants";
import persistenceManager from "@/data/PersistenceManager";

import { Event } from "@/data/EventsManager";

export enum PossibleResultsWithServer {
    NOT_TRIED,
    IS_LOADING,
    SUCCESS,
    FAILED,
}

class NetworkManager {
    // GET request
    // private async get<T>(endpoint: string): Promise<T> {
    //     return new Promise((res, rej) => {
    //         fetch(`${persistenceManager.getServerLocation()}${endpoint}`)
    //             .then(response => response.json().then(body => response.ok ? res({...body, status: response.status}) : rej({...body, status: response.status})))
    //             .catch(error => rej(error));
    //     })

    //     // console.log('endpoint', `${persistenceManager.getServerLocation()}${endpoint}`);
    //     // const response = await ;
    //     // if (!response.ok) {
    //     //     throw new Error('Network response was not ok');
    //     // }
    //     // return response.json();
    // }

    private async get<T>(endpoint: string, queryParams?: Record<string, any>): Promise<T> {
        const toQueryString = (params: Record<string, any>) => {
            return Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');
        };
    
        const queryString = queryParams ? `?${toQueryString(queryParams)}` : '';
        
        return new Promise((res, rej) => {
            fetch(`${persistenceManager.getServerLocation()}${endpoint}${queryString}`)
                .then(response => response.json().then(body => response.ok ? res({...body, status: response.status}) : rej({...body, status: response.status})))
                .catch(error => rej(error));
        });
    }

    // POST request

    private async generalRequest(method: string, url: string, data: any) {
        return new Promise((res, rej) => {
            fetch(`${persistenceManager.getServerLocation()}${url}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json().then(body => response.ok ? res({...body, status: response.status}) : rej({...body, status: response.status})))
            .catch(error => rej(error));
        });
    }
    
    private async post(url: string, data: any) {
        return this.generalRequest('POST', url, data);
    }

    private async put(url: string, data: any) {
        return this.generalRequest('PUT', url, data);
    }

    private async delete(url: string, data: any) {
        return this.generalRequest('DELETE', url, data);
    }

    public async checkServerPresence(): Promise<boolean> {
        try {
            const response: { status: number } = await this.get(networkRoutes.SERVER_REACHABILITY_ROUTE);
            console.log(response);
            return response.status == networkStatusCodes.OK;
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
        const jwtTokenForPermissionRequestsAndProfiles = persistenceManager.getJwtTokenForPermissionsAndProfiles();
        console.log('---', jwtTokenForPermissionRequestsAndProfiles)
        
        const rootProfile = appConstants.DATA_STORAGE_ROOT_PROFILE;
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
                    if (response.status === networkStatusCodes.CREATED) {
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

    public async requestPermissionsForProfile(): Promise<any> {
        const jwtTokenForPermissionRequestsAndProfiles = persistenceManager.getJwtTokenForPermissionsAndProfiles();

        const data = {
            jwtTokenForPermissionRequestsAndProfiles,
            permissionsRequest: appConstants.permissonsObjectForCalendarEventPermissionRequest,
            optionalMessage: "This permission will allow this app to create, modify and see events"
        };
    
        return new Promise((res, rej) => {
            if (jwtTokenForPermissionRequestsAndProfiles == null)
                rej("Your app does not have token saved for this operation");

            this.post(networkRoutes.REQUEST_PERMISSIONS_ROUTE, data)
                .then(response => {
                    console.log('Permissions request successful:', response.message);
                    if (response.generatedAccessToken) {
                        res({
                            message: response.message,
                            generatedAccessToken: response.generatedAccessToken
                        });
                    } else {
                        res({ message: response.message });
                    }
                })
                .catch(error => {
                    console.error('Error requesting permissions:', error);
                    rej(error.message || 'Unknown error during permissions request');
                });
        });
    }

    public async checkAccessTokenStatus(accessToken: string): Promise<boolean> {
        return new Promise(async (res, rej) => {
            try {
                const response: { isActive: boolean } = await this.get(networkRoutes.CHECK_ACCESS_TOKEN_FOR_REQUESTED_PERMISSION, {
                    accessToken
                });
                console.log(response);
                res(response.isActive)
            } catch (error) {
                console.error('Error checking server presence:', error);
                res(false);
            }
        }) 
    }

    public async createNewViewInstance(viewTemplateId: string, viewAccessOptionalName: string = ""): Promise<any> {
        const jwtTokenForPermissionRequestsAndProfiles = persistenceManager.getJwtTokenForPermissionsAndProfiles();

        return new Promise(async (res, rej) => {
            if (jwtTokenForPermissionRequestsAndProfiles == null)
                return rej({ message: "Your app does not have token saved for this operation" });

            const data = {
                viewAccessName: viewAccessOptionalName,
                jwtTokenForPermissionRequestsAndProfiles,
                viewTemplateId,
                configuration: {} // nothing in configuration at the moment
            };

            this.post(networkRoutes.CREATE_NEW_VIEW_INSTANCE, data)
                .then(response => {
                    if (response.status === networkStatusCodes.CREATED) {
                        console.log('Success:', response);
                        // res({viewInstanceToken: response.viewInstanceToken, message: response.message });
                        res(response)
                    } else {
                        console.error('Failure:', response);
                        rej({ message: response.message || 'something went wrong'} );
                    }
                })
                .catch(error => {
                    console.error('error:', error);
                    rej({messae: error.message || 'Network error during new profile creation'});
                });
        })
    }

    public async executeViewInstance(viewInstanceAccessToken: string, clientCustomData = {}): Promise<any> {
        return new Promise(async (res, rej) => {

            const data = {
                viewAccessToken: viewInstanceAccessToken,
                clientCustomData,
            };

            this.post(networkRoutes.RUN_VIEW_INSTANCE, data)
                .then(response => {
                    if (response.status === networkStatusCodes.OK) {
                        // console.log('Success:', response);
                        // res({viewInstanceToken: response.viewInstanceAccessToken, message: response.message });
                        res(response.result);
                    } else {
                        console.error('Failure:', response);
                        rej({ message: response.message || 'View Instance was not run'} );
                    }
                })
                .catch(error => {
                    console.error('error:', error);
                    rej({messae: error.message || 'Network error during view instance execution'});
                });
        })
    }

    public async createNewEvent(event: Event): Promise<any> {
        console.log('creating new event');
        return new Promise(async (res, rej) => {
            const accessToken = persistenceManager.getAccessTokenForEvents();

            if (accessToken == null)
                rej("Your app does not have token saved for this operation");

            const isActive = await this.checkAccessTokenStatus(accessToken!)
            if (!isActive) {
                return rej("You have not granted access to this app for accessing calendar events. You need to do it before the calendar can manipulate events.")
            }


            const data = {
                accessToken,
                profileCommonForAllEventsBeingUploaded: appConstants.calendarEventProfileName,
                events: [
                    event.getEventInFormForSending()
                ]
            }

            this.post(networkRoutes.UPLOAD_NEW_EVENTS_ROUTE, data)
                .then(response => {
                    console.log('Events uploaded successfully', response);
                    res({
                        message: 'Event was created',
                        newEvent: Event.convertEventReceivedFromServerToThisEvent(response.events[0])
                    });
                })
                .catch(error => {
                    console.error('Error uploading events:', error);
                    rej(error.message || 'Unknown error when creating event');
                });
        })
    }

    public getAllCalendarEvents(): Promise<any> {
        return new Promise(async (res, rej) => {
            const accessToken = persistenceManager.getAccessTokenForEvents();
            if (accessToken == null)
                rej("Your app does not have token saved for this operation");
            
            try {
                const response: { events: Array<object>, count: number } = await this.get(networkRoutes.GET_ALL_EVENTS_FOR_GIVEN_ACCESS_TOKEN, {
                    accessToken
                });
                // console.log(response);
                res({
                    ...response,
                    events: response.events.map(event => Event.convertEventReceivedFromServerToThisEvent(event))
                });
            } catch (error) {
                console.error('Error getting calendar events:', error);
                rej(`Error getting calendar events: ${error.message ?? 'Server not reachable probably'}`);
            }
        }) 
    }

    public modifyEvent(event: Event): Promise<any> {
        return new Promise(async (res, rej) => {
            const accessToken = persistenceManager.getAccessTokenForEvents();
            if (accessToken == null)
                rej("Your app does not have token saved for modification of the event");
            
            try {
                const response = await this.put(networkRoutes.MODIFY_GIVEN_EVENT, {
                    accessToken,
                    eventId: event.id,
                    modifiedEvent: event.getEventInFormForSending()
                });
                // console.log(response);
                res(response);
            } catch (error) {
                console.error('Error modifying calendar event:', error);
                rej(`Error modifying calendar event: ${error.message ?? 'Server not reachable probably'}`);
            }
        })
    }

    public deleteEvent(event: Event): Promise<any> {
        return new Promise(async (res, rej) => {
            const accessToken = persistenceManager.getAccessTokenForEvents();
            if (accessToken == null)
                rej("Your app does not have token saved for deletion of the event");
            
            try {
                const response = await this.delete(networkRoutes.DELETE_GIVEN_EVENT, {
                    accessToken,
                    eventId: event.id,
                });
                // console.log(response);
                res(response);
            } catch (error) {
                console.error('Error deleting calendar event:', error);
                rej(`Error deleting calendar event: ${error.message ?? 'Server not reachable probably'}`);
            }
        })
    }

}

export default new NetworkManager()