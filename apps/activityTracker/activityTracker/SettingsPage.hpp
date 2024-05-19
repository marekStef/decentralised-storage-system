#ifndef SETTINGS_PAGE_HPP
#define SETTINGS_PAGE_HPP

#include <wx/wx.h>
#include "wx/notebook.h"

#include "ConfigManager.hpp"
#include "CustomPage.hpp"

class SettingsPage : public CustomPage {
public:
    SettingsPage(wxNotebook* parent, ConfigManager& configManager);
    void OnTabChanged() override;
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

    wxButton* autoStartupButton;

    void setupUI();
};

#endif // SETTINGS_PAGE_HPP