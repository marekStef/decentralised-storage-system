#include "ConfigManager.hpp"
#include "timeHelpers.hpp"

#include <filesystem>
namespace fs = std::filesystem;

ConfigManager::ConfigManager()
    : config(new wxFileConfig(wxEmptyString, wxEmptyString, CONFIG_FILE_PATH, wxEmptyString, wxCONFIG_USE_LOCAL_FILE)) {
    LoadConfig();
}

ConfigManager::~ConfigManager() {
    //delete config;
}

void ConfigManager::LoadConfig() {
    config->Read(SERVER_ADDRESS_CONFIG_KEY, &serverAddress, "");
    config->Read(SERVER_PORT_CONFIG_KEY, &serverPort, "");
    config->Read(DATA_STORAGE_ASSOCIATION_TOKEN_CONFIG_KEY, &dataStorageJwtAssociationToken, "");
    config->Read(DATA_STORAGE_TOKEN_FOR_PROFILES_AND_PERMISSIONS_CONFIG_KEY, &dataStorageTokenForProfilesCreationAndPermissionsRequests, "");
    config->Read(ACTIVITY_TRACKER_EVENT_ACCESS_TOKEN_KEY_, &acitivyTrackerEventAccessToken_, "");

    config->Read(DIRECTORY_FOR_DATA_CONFIG_KEY, &directoryForData, "");

    long temp;

    if (config->Read(PERIODICITY_FOR_SCREENSHOTS_KEY, &temp, 0L)) {
        periodicityForScreenshots = static_cast<int>(temp);
    }
    else {
        periodicityForScreenshots = 100; // default
    }

    if (config->Read(PERIODICITY_FOR_FETCHING_WINDOWS_APPS_INFO_KEY, &temp, 0L)) {
        periodicityForFethcingWindowsAppsInfo = static_cast<int>(temp);
    }
    else {
        periodicityForFethcingWindowsAppsInfo = 100; // default
    }
}

void ConfigManager::SaveConfig() {
    config->Write(SERVER_ADDRESS_CONFIG_KEY, serverAddress);
    config->Write(SERVER_PORT_CONFIG_KEY, serverPort);
    config->Write(DATA_STORAGE_ASSOCIATION_TOKEN_CONFIG_KEY, dataStorageJwtAssociationToken);
    config->Write(DATA_STORAGE_TOKEN_FOR_PROFILES_AND_PERMISSIONS_CONFIG_KEY, dataStorageTokenForProfilesCreationAndPermissionsRequests);
    config->Write(ACTIVITY_TRACKER_EVENT_ACCESS_TOKEN_KEY_, acitivyTrackerEventAccessToken_);

    config->Write(DIRECTORY_FOR_DATA_CONFIG_KEY, directoryForData);

    config->Write(PERIODICITY_FOR_SCREENSHOTS_KEY, periodicityForScreenshots);
    config->Write(PERIODICITY_FOR_FETCHING_WINDOWS_APPS_INFO_KEY, periodicityForFethcingWindowsAppsInfo);

    config->Flush();
}

void ConfigManager::ResetConfig() {
    serverAddress = wxEmptyString;
    serverPort = wxEmptyString;
    dataStorageJwtAssociationToken = wxEmptyString;
    dataStorageTokenForProfilesCreationAndPermissionsRequests = wxEmptyString;
    directoryForData = wxEmptyString;

    SaveConfig();
}

wxString ConfigManager::GetServerAddress() const { return serverAddress; }
void ConfigManager::SetServerAddress(const wxString& value) { serverAddress = value; }

wxString ConfigManager::GetServerPort() const { return serverPort; }
void ConfigManager::SetServerPort(const wxString& value) { serverPort = value; }

wxString ConfigManager::GetDataStorageJwtAssociationToken() const { return dataStorageJwtAssociationToken; }
void ConfigManager::SetDataStorageJwtAssociationToken(const wxString& value) { dataStorageJwtAssociationToken = value; }

wxString ConfigManager::GetDataStorageTokenForProfilesAndPermissionsRequests() const { return dataStorageTokenForProfilesCreationAndPermissionsRequests; }
void ConfigManager::SetDataStorageTokenForProfilesAndPermissionsRequests(const wxString& value) { dataStorageTokenForProfilesCreationAndPermissionsRequests = value; }

wxString ConfigManager::GetActivityTrackerEventAccessToken() const { return acitivyTrackerEventAccessToken_; }
void ConfigManager::SetActivityTrackerEventAccessToken(const wxString& value) {
    acitivyTrackerEventAccessToken_ = value;
}

bool ConfigManager::IsAppProperlySetUp() {
    return !serverAddress.IsEmpty() 
        && !serverPort.IsEmpty() 
        && !dataStorageJwtAssociationToken.IsEmpty() 
        && !dataStorageTokenForProfilesCreationAndPermissionsRequests.IsEmpty() 
        && !acitivyTrackerEventAccessToken_.IsEmpty();
}

wxString ConfigManager::GetDirectory() const { return directoryForData; }
void ConfigManager::SetDirectory(const wxString& directoryForData) { this->directoryForData = directoryForData; }

wxString ConfigManager::GetDirectoryForAppsInfo() const {
    wxFileName dir(GetDirectory(), "");
    if (dir == "") return "";

    dir.AppendDir("apps");
    return dir.GetFullPath();
}

wxString ConfigManager::GetDirectoryForScreenshots() const {
    wxFileName dir(GetDirectory(), "");
    if (dir == "") return "";

    dir.AppendDir("screenshots");
    dir.AppendDir(GetCurrentDateForPath());
    return dir.GetFullPath();
}

fs::path ConfigManager::GetDirectoryForKeyPresses() const {
    fs::path dir = fs::path(GetDirectory().ToStdString());
    if (dir.empty()) return {};

    dir /= "keypresses";
    return dir;
}

int ConfigManager::GetPeriodicityForScreenshots() const { return periodicityForScreenshots; } // in milliseconds

void ConfigManager::SetPeriodicityForScreenshots(int periodicity) { periodicityForScreenshots = periodicity; }

int ConfigManager::GetPeriodicityForFetchingAppsInfo() const { return periodicityForFethcingWindowsAppsInfo; } // in milliseconds

void ConfigManager::SetPeriodicityForFetchingAppsInfo(int periodicity) { periodicityForFethcingWindowsAppsInfo = periodicity; }