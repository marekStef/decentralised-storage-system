#include "ExistingSetupPage.hpp"
#include "dataStorageSetupNetworkHelpers.hpp"

const wxColour disabledGreenColour(0, 255, 0);

ExistingSetupPage::ExistingSetupPage(wxNotebook* parent, ConfigManager& configManager) : wxScrolledWindow(parent), configManager(configManager) {
    setupUI();
    LoadConfig();
}

void ExistingSetupPage::setupUI() {
    this->SetScrollbars(20, 10, 50, 100);
    this->SetTransparent(245);

    wxBoxSizer* sizer = new wxBoxSizer(wxVERTICAL);

    wxStaticBoxSizer* serverSettingSizer = new wxStaticBoxSizer(wxVERTICAL, this, "Server setting");
    serverSettingSizer->Add(new wxStaticText(this, wxID_ANY, "Enter Server Address:"), 0, wxALL, 5);
    serverAddressInputField = new wxTextCtrl(this, wxID_ANY, wxEmptyString, wxDefaultPosition, wxSize(200, -1));
    serverSettingSizer->Add(serverAddressInputField, 0, wxEXPAND | wxLEFT | wxRIGHT, 10);

    serverSettingSizer->Add(new wxStaticText(this, wxID_ANY, "Enter Server Port:"), 0, wxALL, 5);
    serverPortInputField = new wxTextCtrl(this, wxID_ANY, wxEmptyString, wxDefaultPosition, wxSize(200, -1));
    serverSettingSizer->Add(serverPortInputField, 0, wxEXPAND | wxLEFT | wxRIGHT, 10);

    wxButton* checkAuthServicePresenceButton = new wxButton(this, wxID_ANY, "Check Auth Service Presence");
    serverSettingSizer->Add(checkAuthServicePresenceButton, 0, wxALIGN_CENTER | wxALL, 10);
    checkAuthServicePresenceButton->Bind(wxEVT_BUTTON, &ExistingSetupPage::CheckAuthServicePresence, this);

    sizer->Add(serverSettingSizer, 0, wxEXPAND | wxALL, 10);

    wxStaticBoxSizer* dataStorageSettingSizer = new wxStaticBoxSizer(wxVERTICAL, this, "Data Storage Setting");

    dataStorageSettingSizer->Add(new wxStaticText(this, wxID_ANY, "Enter JWT token for profiles and permissions requests:"), 0, wxALL, 5);
    jwtTokenForProfilesAndPermissionsRequestsInputField = new wxTextCtrl(this, wxID_ANY, wxEmptyString, wxDefaultPosition, wxSize(200, -1));
    dataStorageSettingSizer->Add(jwtTokenForProfilesAndPermissionsRequestsInputField, 0, wxEXPAND | wxLEFT | wxRIGHT, 10);

    dataStorageSettingSizer->Add(new wxStaticText(this, wxID_ANY, "Enter Access Token for Activity Tracking Events:"), 0, wxALL, 5);
    accessTokenForActivityTrackingEventsInputField = new wxTextCtrl(this, wxID_ANY, wxEmptyString, wxDefaultPosition, wxSize(200, -1));
    dataStorageSettingSizer->Add(accessTokenForActivityTrackingEventsInputField, 0, wxEXPAND | wxLEFT | wxRIGHT, 10);
    sizer->Add(dataStorageSettingSizer, 0, wxEXPAND | wxALL, 10);

    wxButton* alertButton = new wxButton(this, wxID_ANY, "Save existing configuration");
    sizer->Add(alertButton, 0, wxALIGN_CENTER | wxALL, 10);
    alertButton->Bind(wxEVT_BUTTON, &ExistingSetupPage::SaveExistingConfigurationButtonClickHandler, this);

    this->SetSizer(sizer); // set the sizer for this to arrange its children
    this->Layout(); // This ensures the layout is recalculated
}

void ExistingSetupPage::SaveExistingConfigurationButtonClickHandler(wxCommandEvent& event) {
    wxString tokenForProfilesAndPermissions = jwtTokenForProfilesAndPermissionsRequestsInputField->GetValue();
    wxString accessTokenForEvents = accessTokenForActivityTrackingEventsInputField->GetValue();

    configManager.SetDataStorageTokenForProfilesAndPermissionsRequests(tokenForProfilesAndPermissions);
    configManager.SetActivityTrackerEventAccessToken(accessTokenForEvents);
}

void ExistingSetupPage::CheckAuthServicePresence(wxCommandEvent& event) {
    if (isServerReachable) return;

    wxString serverAddress = serverAddressInputField->GetValue();
    wxString serverPort = serverPortInputField->GetValue();

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

void ExistingSetupPage::DisableServerLocationInputs() {
    serverAddressInputField->SetEditable(false);
    serverPortInputField->SetEditable(false);

    serverAddressInputField->SetBackgroundColour(disabledGreenColour);
    serverPortInputField->SetBackgroundColour(disabledGreenColour);

    serverAddressInputField->Refresh();
    serverPortInputField->Refresh();
}

void ExistingSetupPage::LoadConfig() {
    serverAddressInputField->SetValue(configManager.GetServerAddress());
    serverPortInputField->SetValue(configManager.GetServerPort());
    jwtTokenForProfilesAndPermissionsRequestsInputField->SetValue(configManager.GetDataStorageTokenForProfilesAndPermissionsRequests());
    accessTokenForActivityTrackingEventsInputField->SetValue(configManager.GetActivityTrackerEventAccessToken());
}