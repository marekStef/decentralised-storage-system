#include "InitialSetupPage.hpp"
#include "constants.hpp"

const wxColour PageMainBackgroundColour = wxColour(255, 255, 255);

InitialSetupPage::InitialSetupPage(wxNotebook* parent, ConfigManager& configManager) : wxScrolledWindow(parent), configManager(configManager), timer(new wxTimer(this)) {
    setupUI();

    LoadConfig();

    // bind timer event
    this->Bind(wxEVT_TIMER, [this](wxTimerEvent& event) { this->PeriodicDataGatheringFunction(); }, timer->GetId());
}

void InitialSetupPage::setupUI() {
    this->SetScrollbars(20, 10, 50, 100);
    this->SetBackgroundColour(PageMainBackgroundColour);
    this->SetTransparent(245);

    wxBoxSizer* sizer = new wxBoxSizer(wxVERTICAL);

    wxStaticBoxSizer* serverSettingSizer = new wxStaticBoxSizer(wxVERTICAL, this, "Server setting");

    serverSettingSizer->Add(new wxStaticText(this, wxID_ANY, "Enter Server Address:"), 0, wxALL, 5);
    serverAddressInputField = new wxTextCtrl(this, wxID_ANY, wxEmptyString, wxDefaultPosition, wxSize(200, -1));
    serverSettingSizer->Add(serverAddressInputField, 0, wxEXPAND | wxLEFT | wxRIGHT, 10);

    serverSettingSizer->Add(new wxStaticText(this, wxID_ANY, "Enter Server Port:"), 0, wxALL, 5);
    serverPortInputField = new wxTextCtrl(this, wxID_ANY, wxEmptyString, wxDefaultPosition, wxSize(200, -1));
    serverSettingSizer->Add(serverPortInputField, 0, wxEXPAND | wxLEFT | wxRIGHT, 10);
    sizer->Add(serverSettingSizer, 0, wxEXPAND | wxALL, 10);

    wxStaticBoxSizer* dataStorageTokens = new wxStaticBoxSizer(wxVERTICAL, this, "Data Storage Tokens");
    dataStorageTokens->Add(new wxStaticText(this, wxID_ANY, "Association Token:"), 0, wxALL, 5);
    dataStorageJwtAssociationTokenInputField = new wxTextCtrl(this, wxID_ANY, wxEmptyString, wxDefaultPosition, wxSize(200, -1));
    dataStorageTokens->Add(dataStorageJwtAssociationTokenInputField, 0, wxEXPAND | wxLEFT | wxRIGHT, 10);
    sizer->Add(dataStorageTokens, 0, wxEXPAND | wxALL, 10);

    wxButton* saveButton = new wxButton(this, wxID_ANY, "Associate the app, create needed profiles and ask for permissions");
    sizer->Add(saveButton, 0, wxALIGN_CENTER | wxALL, 10);
    saveButton->Bind(wxEVT_BUTTON, &InitialSetupPage::AssociateAppCreateProfilesAndAskForPermissionsButtonClick, this);

    wxButton* alertButton = new wxButton(this, wxID_ANY, "Start Alert Timer");
    sizer->Add(alertButton, 0, wxALIGN_CENTER | wxALL, 10);
    alertButton->Bind(wxEVT_BUTTON, &InitialSetupPage::OnAlertButtonClick, this);

    lastRunTimeDisplay = new wxStaticText(this, wxID_ANY, "Last run: Never");
    sizer->Add(lastRunTimeDisplay, 0, wxALIGN_CENTER | wxALL, 5);

    this->SetSizer(sizer); // set the sizer for this to arrange its children
    this->Layout(); // This ensures the layout is recalculated
}


void InitialSetupPage::AssociateAppCreateProfilesAndAskForPermissionsButtonClick(wxCommandEvent& event) {
    wxString serverAddress = serverAddressInputField->GetValue();
    wxString serverPort = serverPortInputField->GetValue();
    wxString dataStorageJwtAssociationToken = dataStorageJwtAssociationTokenInputField->GetValue();

    configManager.SetServerAddress(serverAddress);
    configManager.SetServerPort(serverPort);
    configManager.SetDataStorageJwtAssociationToken(dataStorageJwtAssociationToken);

    configManager.SaveConfig();
    DisableAllInputs();
}

void InitialSetupPage::LoadConfig() {
    serverAddressInputField->SetValue(configManager.GetServerAddress());
    serverPortInputField->SetValue(configManager.GetServerPort());
    dataStorageJwtAssociationTokenInputField->SetValue(configManager.GetDataStorageJwtAssociationToken());
}

void InitialSetupPage::DisableAllInputs() {
    serverAddressInputField->Enable(false);
    serverPortInputField->Enable(false);
    dataStorageJwtAssociationTokenInputField->Enable(false);
}

void InitialSetupPage::OnAlertButtonClick(wxCommandEvent& event) {
    startPeriodicDataGathering();
}

void InitialSetupPage::PeriodicDataGatheringFunction() { // wxTimerEvent& event
    wxDateTime currentTime = wxDateTime::Now();
    wxString timeString = currentTime.Format("%Y-%m-%d %H:%M:%S");

    lastRunTimeDisplay->SetLabel(wxString::Format("Last run: %s", timeString));

    wxMessageBox("Time to check!", "Alert", wxOK | wxICON_INFORMATION);
}

void InitialSetupPage::startPeriodicDataGathering() {
    PeriodicDataGatheringFunction();
    timer->Start(PERIODIC_FUNCTION_INTERVAL_IN_MILLISECONDS);
}