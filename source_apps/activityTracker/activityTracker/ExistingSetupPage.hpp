#ifndef EXISTING_SETUP_PAGE_HPP
#define EXISTING_SETUP_PAGE_HPP

#include <wx/wx.h>
#include "wx/notebook.h"

#include "ConfigManager.hpp"

class ExistingSetupPage : public wxScrolledWindow {
public:
    ExistingSetupPage(wxNotebook* parent, ConfigManager& configManager);
private:
    ConfigManager& configManager;

    void setupUI();

    wxTextCtrl* jwtTokenForProfilesAndPermissionsRequestsInputField;
    wxTextCtrl* accessTokenForActivityTrackingEventsInputField;

    void SaveExistingConfigurationButtonClickHandler(wxCommandEvent& event);
};

#endif // EXISTING_SETUP_PAGE_HPP