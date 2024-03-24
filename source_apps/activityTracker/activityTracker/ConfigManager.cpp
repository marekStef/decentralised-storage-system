#include "ConfigManager.hpp"

ConfigManager::ConfigManager()
    : configPath("config.ini"), config(new wxFileConfig(wxEmptyString, wxEmptyString, configPath, wxEmptyString, wxCONFIG_USE_LOCAL_FILE)) {
    LoadConfig();
}

ConfigManager::~ConfigManager() {
    //delete config;
}

void ConfigManager::LoadConfig() {
    config->Read("Text", &textValue, "");
    config->Read("Directory", &directory, "");
}

void ConfigManager::SaveConfig() {
    config->Write("Text", textValue);
    config->Write("Directory", directory);
    config->Flush();
}

wxString ConfigManager::GetTextValue() const {
    return textValue;
}

void ConfigManager::SetTextValue(const wxString& value) {
    textValue = value;
}

wxString ConfigManager::GetDirectory() const {
    return directory;
}

void ConfigManager::SetDirectory(const wxString& directory) {
    this->directory = directory;
}
