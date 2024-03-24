#include "MainFrame.hpp"
#include "constants.hpp"

MainFrame::MainFrame(const wxString& title, ConfigManager& man)
    : wxFrame(NULL, wxID_ANY, title, wxDefaultPosition, wxSize(600, 400)), timer(new wxTimer(this)), configManager(man) {

    SetBackgroundColour(*wxWHITE);

    wxBoxSizer* sizer = new wxBoxSizer(wxVERTICAL);

    inputField = new wxTextCtrl(this, wxID_ANY);
    sizer->Add(inputField, 0, wxEXPAND | wxALL, 5);

    wxButton* saveButton = new wxButton(this, wxID_ANY, "Save");
    sizer->Add(saveButton, 0, wxALL, 5);
    saveButton->Bind(wxEVT_BUTTON, &MainFrame::OnSaveButtonClick, this);

    wxButton* selectDirButton = new wxButton(this, wxID_ANY, "Select Directory");
    sizer->Add(selectDirButton, 0, wxALL, 5);
    selectDirButton->Bind(wxEVT_BUTTON, &MainFrame::OnSelectDirectoryClick, this);

    directoryDisplay = new wxStaticText(this, wxID_ANY, "No directory selected");
    sizer->Add(directoryDisplay, 0, wxALL, 5);

    wxButton* alertButton = new wxButton(this, wxID_ANY, "Start Alert Timer");
    sizer->Add(alertButton, 0, wxALL, 5);
    alertButton->Bind(wxEVT_BUTTON, &MainFrame::OnAlertButtonClick, this);

    lastRunTimeDisplay = new wxStaticText(this, wxID_ANY, "Last run: Never");
    sizer->Add(lastRunTimeDisplay, 0, wxALL, 5);

    SetSizer(sizer);
    Layout();

    LoadConfig();

    // bind timer event
    this->Bind(wxEVT_TIMER, [this](wxTimerEvent& event) { this->PeriodicDataGatheringFunction(); }, timer->GetId());
}

void MainFrame::OnSaveButtonClick(wxCommandEvent& event) {
    wxString text = inputField->GetValue();
    configManager.SetTextValue(text);
    configManager.SetDirectory(defaultDirectory);
    configManager.SaveConfig();

    inputField->SetValue("");
}

void MainFrame::OnSelectDirectoryClick(wxCommandEvent& event) {
    wxDirDialog dirDialog(this, "Choose a directory", "", wxDD_DEFAULT_STYLE | wxDD_DIR_MUST_EXIST);

    if (dirDialog.ShowModal() == wxID_OK) {
        defaultDirectory = dirDialog.GetPath();
        directoryDisplay->SetLabel(defaultDirectory);
        configManager.SetDirectory(defaultDirectory);
        configManager.SaveConfig();
    }
}

void MainFrame::LoadConfig() {
    inputField->SetValue(configManager.GetTextValue());
    directoryDisplay->SetLabel(configManager.GetDirectory());
}

void MainFrame::OnAlertButtonClick(wxCommandEvent& event) {
    startPeriodicDataGathering();
}


void MainFrame::PeriodicDataGatheringFunction() { // wxTimerEvent& event
    wxDateTime currentTime = wxDateTime::Now();
    wxString timeString = currentTime.Format("%Y-%m-%d %H:%M:%S");

    lastRunTimeDisplay->SetLabel(wxString::Format("Last run: %s", timeString));

    wxMessageBox("Time to check!", "Alert", wxOK | wxICON_INFORMATION);
}

void MainFrame::startPeriodicDataGathering() {
    PeriodicDataGatheringFunction();
    timer->Start(PERIODIC_FUNCTION_INTERVAL_IN_MILLISECONDS);
}