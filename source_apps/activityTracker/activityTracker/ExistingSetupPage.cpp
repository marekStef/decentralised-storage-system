#include "ExistingSetupPage.hpp"

ExistingSetupPage::ExistingSetupPage(wxNotebook* parent, ConfigManager& configManager) : wxScrolledWindow(parent), configManager(configManager) {
    setupUI();
}

void ExistingSetupPage::setupUI() {
    this->SetScrollbars(20, 10, 50, 100);
    this->SetTransparent(245);

    wxBoxSizer* sizer = new wxBoxSizer(wxVERTICAL);

    sizer->Add(new wxStaticText(this, wxID_ANY, "Existing Setup Page"), 0, wxALL, 5);

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
    
}
