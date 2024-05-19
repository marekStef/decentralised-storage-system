#ifndef EXISTING_SETUP_PAGE_HPP
#define EXISTING_SETUP_PAGE_HPP

#include <wx/wx.h>
#include "wx/notebook.h"

#include "ConfigManager.hpp"
#include "CustomPage.hpp"

class ExistingSetupPage : public CustomPage {
public:
    ExistingSetupPage(wxNotebook* parent, ConfigManager& configManager);
    void OnTabChanged() override;
private:
    ConfigManager& configManager;

    void setupUI();
    void LoadConfig();

    bool isServerReachable = false;

    wxTextCtrl* serverAddressInputField;
    wxTextCtrl* serverPortInputField;
    wxTextCtrl* jwtTokenForProfilesAndPermissionsRequestsInputField;
    wxTextCtrl* accessTokenForActivityTrackingEventsInputField;

    void SaveExistingConfigurationButtonClickHandler(wxCommandEvent& event);
    void CheckAuthServicePresence(wxCommandEvent& event);

    void DisableServerLocationInputs();
};

#endif // EXISTING_SETUP_PAGE_HPP