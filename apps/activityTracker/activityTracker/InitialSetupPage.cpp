#include "InitialSetupPage.hpp"
#include "constants.hpp"
#include "JsonHelpers.hpp"
#include "nlohmann/json.hpp"

#include "windowsAppsInfoNetworkHelpers.hpp"
#include "dataStorageSetupNetworkHelpers.hpp"

const wxColour PageMainBackgroundColour = wxColour(255, 255, 255);
const wxColour disabledGreenColour(0, 255, 0);

InitialSetupPage::InitialSetupPage(wxNotebook* parent, ConfigManager& configManager) : CustomPage(parent), configManager(configManager) {
    if (configManager.IsAppProperlySetUp())
        setupAlreadySetupUI();
    else {
        setupUI();
        LoadConfig();
    }
}

void InitialSetupPage::setupAlreadySetupUI() {
    this->DestroyChildren();
    wxBoxSizer* sizer = new wxBoxSizer(wxVERTICAL);

    wxStaticText* staticText = new wxStaticText(this, wxID_ANY, wxT("The App Is Already Set - Please approve permissions requests in the Control Centre if you haven't done so"),
        wxDefaultPosition, wxDefaultSize,
        wxALIGN_CENTER_HORIZONTAL);
    staticText->SetForegroundColour(*wxGREEN);

    sizer->Add(staticText, 0, wxALIGN_CENTER | wxALL, 10);

    this->SetSizer(sizer); // set the sizer for this to arrange its children
    this->Layout(); // This ensures the layout is recalculated
}

void InitialSetupPage::setupUI() {
    this->DestroyChildren();
    this->SetScrollbars(20, 10, 50, 100);
    this->SetBackgroundColour(PageMainBackgroundColour);
    this->SetTransparent(245);

    wxBoxSizer* sizer = new wxBoxSizer(wxVERTICAL);

    wxStaticBoxSizer* serverSettingSizer = new wxStaticBoxSizer(wxVERTICAL, this, "Server setting");
    serverSettingSizer->Add(new wxStaticText(this, wxID_ANY, "Enter Server Address: (such as http://localhost)"), 0, wxALL, 5);
    serverAddressInputField = new wxTextCtrl(this, wxID_ANY, wxEmptyString, wxDefaultPosition, wxSize(200, -1));
    serverSettingSizer->Add(serverAddressInputField, 0, wxEXPAND | wxLEFT | wxRIGHT, 10);

    serverSettingSizer->Add(new wxStaticText(this, wxID_ANY, "Enter Server Port: (such as 8020)"), 0, wxALL, 5);
    serverPortInputField = new wxTextCtrl(this, wxID_ANY, wxEmptyString, wxDefaultPosition, wxSize(200, -1));
    serverSettingSizer->Add(serverPortInputField, 0, wxEXPAND | wxLEFT | wxRIGHT, 10);

    wxButton* checkAuthServicePresenceButton = new wxButton(this, wxID_ANY, "Check Auth Service Presence");
    serverSettingSizer->Add(checkAuthServicePresenceButton, 0, wxALIGN_CENTER | wxALL, 10);
    checkAuthServicePresenceButton->Bind(wxEVT_BUTTON, &InitialSetupPage::CheckAuthServicePresence, this);

    sizer->Add(serverSettingSizer, 0, wxEXPAND | wxALL, 10);

    wxStaticBoxSizer* dataStorageTokensSizer = new wxStaticBoxSizer(wxVERTICAL, this, "Data Storage Tokens");
    dataStorageTokensSizer->Add(new wxStaticText(this, wxID_ANY, "Association Token:"), 0, wxALL, 5);
    dataStorageJwtAssociationTokenInputField = new wxTextCtrl(this, wxID_ANY, wxEmptyString, wxDefaultPosition, wxSize(200, -1));
    dataStorageTokensSizer->Add(dataStorageJwtAssociationTokenInputField, 0, wxEXPAND | wxLEFT | wxRIGHT, 10);
    wxButton* associateAppButton = new wxButton(this, wxID_ANY, "Associate the app");
    dataStorageTokensSizer->Add(associateAppButton, 0, wxALIGN_CENTER | wxALL, 10);
    associateAppButton->Bind(wxEVT_BUTTON, &InitialSetupPage::AssociateTheAppWithDataStorageButtonClick, this);
    sizer->Add(dataStorageTokensSizer, 0, wxEXPAND | wxALL, 10);

    wxStaticBoxSizer* profilesAndPermissionsSizer = new wxStaticBoxSizer(wxVERTICAL, this, "Profiles And Permissions");

    wxButton* createProfilesAndAskForPermissionsButton = new wxButton(this, wxID_ANY, "Create Profiles And Ask For Permissions");
    profilesAndPermissionsSizer->Add(createProfilesAndAskForPermissionsButton, 0, wxALIGN_CENTER | wxALL, 10);
    createProfilesAndAskForPermissionsButton->Bind(wxEVT_BUTTON, &InitialSetupPage::CreateProfilesAndAskForPermissionsButtonClick, this);
    sizer->Add(profilesAndPermissionsSizer, 0, wxEXPAND | wxALL, 10);

    wxButton* saveSetupAndProceedButton = new wxButton(this, wxID_ANY, "Save Setup And Proceed");
    sizer->Add(saveSetupAndProceedButton, 0, wxALIGN_CENTER | wxALL, 10);
    saveSetupAndProceedButton->Bind(wxEVT_BUTTON, &InitialSetupPage::SaveSetupAndProceedButtonClick, this);

    sizer->Add(new wxStaticText(this, wxID_ANY, "If you need to reset setup, go to Settings"), 0, wxALL, 5);

    this->SetSizer(sizer); // set the sizer for this to arrange its children
    this->Layout(); // This ensures the layout is recalculated
}




void InitialSetupPage::CheckAuthServicePresence(wxCommandEvent& event) {
    if (isServerReachable) return;

    wxString serverAddress = serverAddressInputField->GetValue();
    wxString serverPort = serverPortInputField->GetValue();
    wxString dataStorageJwtAssociationToken = dataStorageJwtAssociationTokenInputField->GetValue();

    configManager.SetServerAddress(serverAddress);
    configManager.SetServerPort(serverPort);

    if (CheckAuthServicePresenceCurl(serverAddress.ToStdString(), serverPort.ToStdString())) {
        configManager.SaveConfig();
        DisableServerLocationInputs();
        isServerReachable = true;
    }
    else {
        wxMessageBox("Server is not reachable", "Alert", wxOK | wxICON_INFORMATION);
    }
}

void InitialSetupPage::AssociateTheAppWithDataStorageButtonClick(wxCommandEvent& event) {
    if (!isServerReachable) {
        wxMessageBox("Server must be reachable", "Alert", wxOK | wxICON_INFORMATION);
        return;
    }

    wxString associationTokenValue = dataStorageJwtAssociationTokenInputField->GetValue();

    auto tokenForProfilesAndPermissions = AssociateWithStorageAppHolder(
        configManager.GetServerAddress().ToStdString(),
        configManager.GetServerPort().ToStdString(),
        associationTokenValue.ToStdString()
    );

    if (tokenForProfilesAndPermissions.empty())
        wxMessageBox("Something went wrong", "Alert", wxOK | wxICON_INFORMATION);
    else {
        wxMessageBox("Successfully associated", "Alert", wxOK | wxICON_INFORMATION);
        configManager.SetDataStorageJwtAssociationToken(associationTokenValue);
        configManager.SetDataStorageTokenForProfilesAndPermissionsRequests(tokenForProfilesAndPermissions);
        configManager.SaveConfig();
        DisableAssociationTokenInput();
        isAppAssociated = true;
    }
}

void InitialSetupPage::CreateProfilesAndAskForPermissionsButtonClick(wxCommandEvent& event) {
    if (!isAppAssociated) {
        wxMessageBox("App must be associated first", "Alert", wxOK | wxICON_INFORMATION);
        return;
    }

    try {
        json jsonProfileSchema = loadActivityTrackingEventProfileSchema();

        std::string responseMessage = "";
        bool wasProfileRegistered = RegisterNewProfile(
            configManager.GetServerAddress().ToStdString(),
            configManager.GetServerPort().ToStdString(),
            configManager.GetDataStorageTokenForProfilesAndPermissionsRequests().ToStdString(),
            jsonProfileSchema,
            responseMessage
        );

        wxMessageBox("Creating new profile: " + responseMessage, "Alert", wxOK | wxICON_INFORMATION);
        if (!wasProfileRegistered) {
            return;
        }
        /*wxMessageBox(configManager.GetDirectory().ToStdString() + "\\testingjson\\json.json TESTING - SAVED IT THERE", "Alert", wxOK | wxICON_INFORMATION);
        saveJsonToFile(jsonProfileSchema, configManager.GetDirectory().ToStdString() + "\\testingjson\\json.json");*/
    }
    catch (const std::exception& e) {
        wxMessageBox(e.what(), "Alert", wxOK | wxICON_INFORMATION);
    }

    // profile is successfully registered at this moment, create WRITE permission for it now
    std::string responseMessage = "";
    std::string generatedAccessToken = "aaaa";
    bool wasPermissionRequestedSuccessfully = RequestNewPermission(
        configManager.GetServerAddress().ToStdString(),
        configManager.GetServerPort().ToStdString(),
        configManager.GetDataStorageTokenForProfilesAndPermissionsRequests().ToStdString(),
        responseMessage,
        generatedAccessToken
    );
    if (!wasPermissionRequestedSuccessfully) {
        wxMessageBox("Problem requesting a permission: " + responseMessage, "Alert", wxOK | wxICON_INFORMATION);
        return;
    }

    
    wxMessageBox("Successfully created profile and asked for permissions", "Alert", wxOK | wxICON_INFORMATION);
    configManager.SetActivityTrackerEventAccessToken(generatedAccessToken);
    configManager.SaveConfig();

    areProfilesCreatedAndPermissionsAsked = true;
}

void InitialSetupPage::SaveSetupAndProceedButtonClick(wxCommandEvent& event) {
    setupAlreadySetupUI();
    return;

    if (!areProfilesCreatedAndPermissionsAsked) {
        wxMessageBox("Profiles must be registered first and permissions requested", "Alert", wxOK | wxICON_INFORMATION);
        return;
    }
}

void InitialSetupPage::LoadConfig() {
    if (configManager.IsAppProperlySetUp()) {
        setupAlreadySetupUI();
        return;
    }
    serverAddressInputField->SetValue(configManager.GetServerAddress());
    serverPortInputField->SetValue(configManager.GetServerPort());
    dataStorageJwtAssociationTokenInputField->SetValue(configManager.GetDataStorageJwtAssociationToken());
}

void InitialSetupPage::DisableServerLocationInputs() {
    serverAddressInputField->SetEditable(false);
    serverPortInputField->SetEditable(false);

    serverAddressInputField->SetBackgroundColour(disabledGreenColour);
    serverPortInputField->SetBackgroundColour(disabledGreenColour);

    serverAddressInputField->Refresh();
    serverPortInputField->Refresh();
}

void InitialSetupPage::DisableAssociationTokenInput() {
    dataStorageJwtAssociationTokenInputField->SetEditable(false);
    dataStorageJwtAssociationTokenInputField->SetBackgroundColour(disabledGreenColour);
}

void InitialSetupPage::OnTabChanged() {
    LoadConfig();
}