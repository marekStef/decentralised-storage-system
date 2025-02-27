#include "SettingsPage.hpp"
#include "automaticStartupHelpers.hpp"

#include <wx/spinctrl.h>

SettingsPage::SettingsPage(wxNotebook* parent, ConfigManager& configManager) : CustomPage(parent), configManager(configManager) {
    setupUI();
    loadConfig();
}

void SettingsPage::setupUI() {
    this->SetScrollbars(20, 10, 50, 100);
    this->SetTransparent(245);

    wxBoxSizer* sizer = new wxBoxSizer(wxVERTICAL);

    sizer->Add(new wxStaticText(this, wxID_ANY, "Settings Page"), 0, wxALL, 5);

    wxStaticBoxSizer* directorySizer = new wxStaticBoxSizer(wxVERTICAL, this, "Directory Selection");
    wxButton* selectDirButton = new wxButton(this, wxID_ANY, "Select Directory");
    directorySizer->Add(selectDirButton, 0, wxALL, 5);
    selectDirButton->Bind(wxEVT_BUTTON, &SettingsPage::OnSelectDirectoryClick, this);
    directoryDisplay = new wxStaticText(this, wxID_ANY, "No directoryForData selected");
    directorySizer->Add(directoryDisplay, 0, wxALL, 5);
    sizer->Add(directorySizer, 0, wxEXPAND | wxALL, 10);

    wxStaticBoxSizer* periodicitySizer = new wxStaticBoxSizer(wxVERTICAL, this, "Set Periodicity For Screenshots (in seconds)");
    screenshotsPeriodicitySpinCtrl = new wxSpinCtrl(this, wxID_ANY);
    screenshotsPeriodicitySpinCtrl->SetRange(1, 1000000);
    screenshotsPeriodicitySpinCtrl->SetValue(60); // Default value
    periodicitySizer->Add(screenshotsPeriodicitySpinCtrl, 0, wxALL | wxEXPAND, 5);
    sizer->Add(periodicitySizer, 0, wxEXPAND | wxALL, 10);
    screenshotsPeriodicitySpinCtrl->Bind(wxEVT_SPINCTRL, &SettingsPage::onScreenshotsPeriodicityChange, this);

    wxStaticBoxSizer* appsInfoFetchingPeriodicitySizer = new wxStaticBoxSizer(wxVERTICAL, this, "Set Periodicity For Getting Apps Info (in seconds)");
    appsInfoFetchingPeriodicitySpinCtrl = new wxSpinCtrl(this, wxID_ANY);
    appsInfoFetchingPeriodicitySpinCtrl->SetRange(1, 1000000);
    appsInfoFetchingPeriodicitySpinCtrl->SetValue(60); // Default value
    appsInfoFetchingPeriodicitySizer->Add(appsInfoFetchingPeriodicitySpinCtrl, 0, wxALL | wxEXPAND, 5);
    sizer->Add(appsInfoFetchingPeriodicitySizer, 0, wxEXPAND | wxALL, 10);
    appsInfoFetchingPeriodicitySpinCtrl->Bind(wxEVT_SPINCTRL, &SettingsPage::onAppsInfoFetchingPeriodicityChange, this);

    wxStaticBoxSizer* automaticStartupSizer = new wxStaticBoxSizer(wxVERTICAL, this, "Automatic Startup");
    bool isAppAmongStartupApps = IsAppInStartupList();
    autoStartupButton = new wxButton(this, wxID_ANY, isAppAmongStartupApps? "Remove From Auto Startup" : "Add Auto Startup");
    automaticStartupSizer->Add(autoStartupButton, 0, wxALL, 5);
    autoStartupButton->Bind(wxEVT_BUTTON, &SettingsPage::OnAutomaticAppStartupButtonClick, this);
    sizer->Add(automaticStartupSizer, 0, wxEXPAND | wxALL, 10);

    wxStaticBoxSizer* appResettingSizer = new wxStaticBoxSizer(wxVERTICAL, this, "App Resetting");
    wxButton* resetAppButton = new wxButton(this, wxID_ANY, "Reset The Whole App");
    appResettingSizer->Add(resetAppButton, 0, wxALL, 5);
    resetAppButton->Bind(wxEVT_BUTTON, &SettingsPage::OnResetAppConfigButtonClick, this);
    sizer->Add(appResettingSizer, 0, wxEXPAND | wxALL, 10);

    this->SetSizer(sizer); // set the sizer for this to arrange its children
    this->Layout(); // This ensures the layout is recalculated
}

void SettingsPage::OnSelectDirectoryClick(wxCommandEvent& event) {
    wxDirDialog dirDialog(this, "Choose a directoryForData", "", wxDD_DEFAULT_STYLE | wxDD_DIR_MUST_EXIST);

    if (dirDialog.ShowModal() == wxID_OK) {
        defaultDirectory = dirDialog.GetPath();
        directoryDisplay->SetLabel(defaultDirectory);
        configManager.SetDirectory(defaultDirectory);
        configManager.SaveConfig();
    }
}

void SettingsPage::OnAutomaticAppStartupButtonClick(wxCommandEvent& event) {
    bool isAppAmongStartupApps = IsAppInStartupList();

    if (isAppAmongStartupApps) {
        autoStartupButton->SetLabel("Add Auto Startup");
        //MessageBox(NULL, L"removed.", L"Success", MB_OK);
        RemoveAppFromStartup();
    }
    else {
        autoStartupButton->SetLabel("Remove From Auto Startup");
        //MessageBox(NULL, L"added.", L"Success", MB_OK);
        addAppToAutomaticStartupAppsList();
    }

    wxSize bestSize = autoStartupButton->GetBestSize();
    autoStartupButton->SetMinSize(bestSize);
    autoStartupButton->SetSize(bestSize);
    this->Layout();

    autoStartupButton->Refresh();
    autoStartupButton->Update();
}

void SettingsPage::OnResetAppConfigButtonClick(wxCommandEvent& event) {
    configManager.ResetConfig();
    wxMessageBox("You need to restart the app to fully reset the app", "Alert", wxOK | wxICON_INFORMATION);
    loadConfig();
}

void SettingsPage::onScreenshotsPeriodicityChange(wxSpinEvent& event) {
    int periodicityValue = event.GetValue();
    configManager.SetPeriodicityForScreenshots(periodicityValue * 1000); // needs to be in milliseconds
    configManager.SaveConfig();
}

void SettingsPage::onAppsInfoFetchingPeriodicityChange(wxSpinEvent& event) {
    int periodicityValue = event.GetValue();
    configManager.SetPeriodicityForFetchingAppsInfo(periodicityValue * 1000);  // needs to be in milliseconds
    configManager.SaveConfig();
}

void SettingsPage::loadConfig() {
    directoryDisplay->SetLabel(configManager.GetDirectory());
    screenshotsPeriodicitySpinCtrl->SetValue(configManager.GetPeriodicityForScreenshots() / 1000); // to display it in seconds
    appsInfoFetchingPeriodicitySpinCtrl->SetValue(configManager.GetPeriodicityForFetchingAppsInfo() / 1000); // to display it in seconds
}

void SettingsPage::OnTabChanged() {
}