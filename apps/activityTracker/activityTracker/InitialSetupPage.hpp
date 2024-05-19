#ifndef INITIAL_SETUP_PAGE_HPP
#define INITIAL_SETUP_PAGE_HPP

#include <wx/wx.h>
#include "wx/notebook.h"

#include "ConfigManager.hpp"
#include "CustomPage.hpp"

class InitialSetupPage : public CustomPage {
public:
    InitialSetupPage(wxNotebook* parent, ConfigManager& configManager);
    void OnTabChanged() override;
private:
    ConfigManager& configManager;

    void setupUI();
    void setupAlreadySetupUI();

    wxTextCtrl* serverAddressInputField;
    wxTextCtrl* serverPortInputField;
    wxTextCtrl* dataStorageJwtAssociationTokenInputField;
    wxTextCtrl* dataStorageJwtTokenForProfilesAndPermissionsRequests;

    void CheckAuthServicePresence(wxCommandEvent& event);
    void AssociateTheAppWithDataStorageButtonClick(wxCommandEvent& event);
    void CreateProfilesAndAskForPermissionsButtonClick(wxCommandEvent& event);
    void SaveSetupAndProceedButtonClick(wxCommandEvent& event);

    void LoadConfig();

    bool isServerReachable = false;
    bool isAppAssociated = false;
    bool areProfilesCreatedAndPermissionsAsked = false;

    void DisableServerLocationInputs();
    void DisableAssociationTokenInput();


};

#endif // INITIAL_SETUP_PAGE_HPP