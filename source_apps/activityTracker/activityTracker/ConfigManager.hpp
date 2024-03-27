#ifndef CONFIGMANAGER_H
#define CONFIGMANAGER_H

#include <wx/fileconf.h>

const wxString CONFIG_FILE_PATH = "configg.ini";

const wxString SERVER_ADDRESS_CONFIG_KEY = "SERVER_ADDRESS_CONFIG_KEY";
const wxString SERVER_PORT_CONFIG_KEY = "SERVER_PORT_CONFIG_KEY";
const wxString DATA_STORAGE_ASSOCIATION_TOKEN_CONFIG_KEY = "DATA_STORAGE_ASSOCIATION_TOKEN_CONFIG_KEY";
const wxString DATA_STORAGE_TOKEN_FOR_PROFILES_AND_PERMISSIONS_CONFIG_KEY = "DATA_STORAGE_TOKEN_FOR_PROFILES_AND_PERMISSIONS_CONFIG_KEY";
const wxString ACTIVITY_TRACKER_EVENT_ACCESS_TOKEN_KEY_ = "ACTIVITY_TRACKER_EVENT_ACCESS_TOKEN_KEY_";

const wxString DIRECTORY_FOR_DATA_CONFIG_KEY = "DATA_STORAGE_TOKEN_FOR_PROFILES_AND_PERMISSIONS";

class ConfigManager {
public:
    ConfigManager();
    ~ConfigManager();

    void LoadConfig();
    void SaveConfig();
    void ResetConfig();

    wxString GetServerAddress() const;
    void SetServerAddress(const wxString& value);

    wxString GetServerPort() const;
    void SetServerPort(const wxString& value);

    wxString GetDataStorageJwtAssociationToken() const;
    void SetDataStorageJwtAssociationToken(const wxString& value);

    wxString GetDataStorageTokenForProfilesAndPermissionsRequests() const;
    void SetDataStorageTokenForProfilesAndPermissionsRequests(const wxString& value);

    wxString GetActivityTrackerEventAccessToken() const;
    void SetActivityTrackerEventAccessToken(const wxString& value);

    bool IsAppProperlySetUp();

    wxString GetDirectory() const;
    void SetDirectory(const wxString& directoryForData);

    wxString GetDirectoryForAppsInfo() const;

private:
    wxString serverAddress;
    wxString serverPort;
    wxString dataStorageJwtAssociationToken;
    wxString dataStorageTokenForProfilesCreationAndPermissionsRequests;
    wxString acitivyTrackerEventAccessToken_;

    wxFileConfig* config;

    wxString directoryForData;
};

#endif // CONFIGMANAGER_H
