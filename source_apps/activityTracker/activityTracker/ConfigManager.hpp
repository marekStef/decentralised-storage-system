#ifndef CONFIGMANAGER_H
#define CONFIGMANAGER_H

#include <wx/fileconf.h>

class ConfigManager {
public:
    ConfigManager();
    ~ConfigManager();

    void LoadConfig();
    void SaveConfig();

    wxString GetTextValue() const;
    void SetTextValue(const wxString& value);

    wxString GetDirectory() const;
    void SetDirectory(const wxString& directory);

private:
    wxString configPath;
    wxFileConfig* config;

    wxString textValue;
    wxString directory;
};

#endif // CONFIGMANAGER_H
