#include "ConfigManager.hpp"


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

    config->Read(DIRECTORY_FOR_DATA_CONFIG_KEY, &directoryForData, "");
}

void ConfigManager::SaveConfig() {
    config->Write(SERVER_ADDRESS_CONFIG_KEY, serverAddress);
    config->Write(SERVER_PORT_CONFIG_KEY, serverPort);
    config->Write(DATA_STORAGE_ASSOCIATION_TOKEN_CONFIG_KEY, dataStorageJwtAssociationToken);
    config->Write(DATA_STORAGE_TOKEN_FOR_PROFILES_AND_PERMISSIONS_CONFIG_KEY, dataStorageTokenForProfilesCreationAndPermissionsRequests);

    config->Write(DIRECTORY_FOR_DATA_CONFIG_KEY, directoryForData);

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

wxString ConfigManager::GetDirectory() const { return directoryForData; }
void ConfigManager::SetDirectory(const wxString& directoryForData) { this->directoryForData = directoryForData; }

wxString ConfigManager::GetDirectoryForAppsInfo() const {
    wxFileName dir(GetDirectory(), "");
    if (dir == "") return "";

    dir.AppendDir("apps");
    return dir.GetFullPath();
}
