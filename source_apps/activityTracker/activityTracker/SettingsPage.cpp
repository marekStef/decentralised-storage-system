#include "SettingsPage.hpp"
#include "automaticStartupHelpers.hpp"

SettingsPage::SettingsPage(wxNotebook* parent, ConfigManager& configManager) : wxScrolledWindow(parent), configManager(configManager) {
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

    wxStaticBoxSizer* automaticStartupSizer = new wxStaticBoxSizer(wxVERTICAL, this, "Automatic Startup");
    wxButton* loginButton = new wxButton(this, 1111, IsAppInStartupList() ? "Remove From Auto Startup" : "Add Auto Startup");
    automaticStartupSizer->Add(loginButton, 0, wxALL, 5);
    loginButton->Bind(wxEVT_BUTTON, &SettingsPage::OnAutomaticAppStartupButtonClick, this);
    sizer->Add(automaticStartupSizer, 0, wxEXPAND | wxALL, 10);

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
    wxButton* button = dynamic_cast<wxButton*>(event.GetEventObject());
    

    bool isAppAmongStartupApps = IsAppInStartupList();

    if (isAppAmongStartupApps) {
        button->SetLabel("Remove From Auto Startup");
        MessageBox(NULL, L"added.", L"Success", MB_OK);
        RemoveAppFromStartup();
    }
    else {
        button->SetLabel("Add Auto Startup");
        MessageBox(NULL, L"removed.", L"Success", MB_OK);
        addAppToAutomaticStartupAppsList();
    }

    wxSize bestSize = button->GetBestSize();
    button->SetMinSize(bestSize);
    button->SetSize(bestSize);
    this->Layout();

    button->Refresh();
    button->Update();
}


void SettingsPage::loadConfig() {
    directoryDisplay->SetLabel(configManager.GetDirectory());
}

