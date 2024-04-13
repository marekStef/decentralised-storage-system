#ifndef SETTINGS_PAGE_HPP
#define SETTINGS_PAGE_HPP

#include <wx/wx.h>
#include "wx/notebook.h"

#include "ConfigManager.hpp"

class SettingsPage : public wxScrolledWindow {
public:
    SettingsPage(wxNotebook* parent, ConfigManager& configManager);
private:
    ConfigManager& configManager;
    void loadConfig();

    void OnSelectDirectoryClick(wxCommandEvent& event);
    void OnAutomaticAppStartupButtonClick(wxCommandEvent& event);
    void OnResetAppConfigButtonClick(wxCommandEvent& event);

    wxStaticText* directoryDisplay;
    wxString defaultDirectory;

    wxSpinCtrl* screenshotsPeriodicitySpinCtrl;
    void onScreenshotsPeriodicityChange(wxSpinEvent& event); 
    
    wxSpinCtrl* appsInfoFetchingPeriodicitySpinCtrl;
    void onAppsInfoFetchingPeriodicityChange(wxSpinEvent& event);

    void setupUI();
};

#endif // SETTINGS_PAGE_HPP