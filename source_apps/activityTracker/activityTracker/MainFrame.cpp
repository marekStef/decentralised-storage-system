#include "MainFrame.hpp"
#include "constants.hpp"

#include <wx/scrolwin.h>

// Event table for handling window events
BEGIN_EVENT_TABLE(MainFrame, wxFrame)
    EVT_CLOSE(MainFrame::OnClose) // Handles the close event of the window.
    EVT_ICONIZE(MainFrame::OnIconize) // Handles the iconize event (when the window is minimized )
    EVT_MENU(ID_Restore, MainFrame::OnRestore) // Handles the menu event for restoring the window from the tray - not working at this moment
    EVT_MENU(ID_Exit, MainFrame::OnExit) // Handles the menu event for exiting the application.
END_EVENT_TABLE()

MainFrame::MainFrame(const wxString& title, ConfigManager& configManager)
    : wxFrame(NULL, wxID_ANY, title, wxDefaultPosition, wxSize(600, 400)), timer(new wxTimer(this)), configManager(configManager), taskBarIcon(new wxTaskBarIcon()) {

    SetIcon(wxIcon("Icon.ico", wxBITMAP_TYPE_ICO));
    taskBarIcon->Bind(wxEVT_TASKBAR_LEFT_UP, &MainFrame::OnTaskBarIconClick, this);

    setupUI();

    LoadConfig();

    // bind timer event
    this->Bind(wxEVT_TIMER, [this](wxTimerEvent& event) { this->PeriodicDataGatheringFunction(); }, timer->GetId());
}
void MainFrame::setupUI() {
    wxBoxSizer* mainSizer = new wxBoxSizer(wxVERTICAL);
    SetTransparent(245);

    notebook = new wxNotebook(this, wxID_ANY);

    wxScrolledWindow* initialSetupPage = new wxScrolledWindow(notebook, wxID_ANY);
    InitialPageSetup(initialSetupPage);

    wxScrolledWindow* existingSetupPage = new wxScrolledWindow(notebook, wxID_ANY);
    ExistingPageSetup(existingSetupPage);

    wxScrolledWindow* mainPage = new wxScrolledWindow(notebook, wxID_ANY);
    PageMain(mainPage);

    notebook->AddPage(initialSetupPage, "Initial DataStorage Setup", true); // true to make it the selected tab
    notebook->AddPage(existingSetupPage, "Existing DataStorage Setup"); // true to make it the selected tab
    notebook->AddPage(mainPage, "Main");

    mainSizer->Add(notebook, 1, wxEXPAND, 0);

    this->SetSizer(mainSizer);
    Layout();

}
void MainFrame::InitialPageSetup(wxScrolledWindow* parent) {
    parent->SetScrollbars(20, 20, 50, 50);
    parent->SetBackgroundColour(wxColour(255, 255, 255));
    parent->SetTransparent(245);

    wxBoxSizer* sizer = new wxBoxSizer(wxVERTICAL);

    wxStaticBoxSizer* serverSettingSizer = new wxStaticBoxSizer(wxVERTICAL, parent, "Server setting");

    serverSettingSizer->Add(new wxStaticText(parent, wxID_ANY, "Enter Server Address:"), 0, wxALL, 5);
    serverAddressInputField = new wxTextCtrl(parent, wxID_ANY, wxEmptyString, wxDefaultPosition, wxSize(200, -1));
    serverSettingSizer->Add(serverAddressInputField, 0, wxEXPAND | wxLEFT | wxRIGHT, 10);

    serverSettingSizer->Add(new wxStaticText(parent, wxID_ANY, "Enter Server Port:"), 0, wxALL, 5);
    serverPortInputField = new wxTextCtrl(parent, wxID_ANY, wxEmptyString, wxDefaultPosition, wxSize(200, -1));
    serverSettingSizer->Add(serverPortInputField, 0, wxEXPAND | wxLEFT | wxRIGHT, 10);
    sizer->Add(serverSettingSizer, 0, wxEXPAND | wxALL, 10);

    wxStaticBoxSizer* dataStorageTokens = new wxStaticBoxSizer(wxVERTICAL, parent, "Data Storage Tokens");
    dataStorageTokens->Add(new wxStaticText(parent, wxID_ANY, "Association Token:"), 0, wxALL, 5);
    serverAddressInputField = new wxTextCtrl(parent, wxID_ANY, wxEmptyString, wxDefaultPosition, wxSize(200, -1));
    dataStorageTokens->Add(serverAddressInputField, 0, wxEXPAND | wxLEFT | wxRIGHT, 10);
    sizer->Add(dataStorageTokens, 0, wxEXPAND | wxALL, 10);

    wxButton* saveButton = new wxButton(parent, wxID_ANY, "Associate the app, create needed profiles and ask for permissions");
    sizer->Add(saveButton, 0, wxALIGN_CENTER | wxALL, 10);
    saveButton->Bind(wxEVT_BUTTON, &MainFrame::OnSaveButtonClick, this);

    wxStaticBoxSizer* directorySizer = new wxStaticBoxSizer(wxVERTICAL, parent, "Directory Selection");
    wxButton* selectDirButton = new wxButton(parent, wxID_ANY, "Select Directory");
    directorySizer->Add(selectDirButton, 0, wxALIGN_CENTER | wxALL, 5);
    selectDirButton->Bind(wxEVT_BUTTON, &MainFrame::OnSelectDirectoryClick, this);

    directoryDisplay = new wxStaticText(parent, wxID_ANY, "No directory selected");
    directorySizer->Add(directoryDisplay, 0, wxALIGN_CENTER | wxALL, 5);
    sizer->Add(directorySizer, 0, wxEXPAND | wxALL, 10);

    wxButton* alertButton = new wxButton(parent, wxID_ANY, "Start Alert Timer");
    sizer->Add(alertButton, 0, wxALIGN_CENTER | wxALL, 10);
    alertButton->Bind(wxEVT_BUTTON, &MainFrame::OnAlertButtonClick, this);

    lastRunTimeDisplay = new wxStaticText(parent, wxID_ANY, "Last run: Never");
    sizer->Add(lastRunTimeDisplay, 0, wxALIGN_CENTER | wxALL, 5);

    wxButton* exitAppButton = new wxButton(parent, wxID_ANY, wxT("Exit App"));
    sizer->Add(exitAppButton, 0, wxALIGN_CENTER | wxBOTTOM, 10);
    exitAppButton->Bind(wxEVT_BUTTON, &MainFrame::OnExit, this);

    parent->SetSizer(sizer); // set the sizer for parent to arrange its children
    parent->Layout(); // This ensures the layout is recalculated
}

void MainFrame::ExistingPageSetup(wxScrolledWindow* parent) {

}

void MainFrame::PageMain(wxScrolledWindow* parent) {

}


void MainFrame::OnSaveButtonClick(wxCommandEvent& event) {
    wxString text = serverAddressInputField->GetValue();
    configManager.SetTextValue(text);
    configManager.SetDirectory(defaultDirectory);
    configManager.SaveConfig();

    serverAddressInputField->SetValue("");
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
    serverAddressInputField->SetValue(configManager.GetTextValue());
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

void MainFrame::OnClose(wxCloseEvent& event) {
    // Check if the close event can be vetoed. This is true for events that are not a result of a system shutdown.
    if (event.CanVeto()) {
        // Hide the window instead of closing it. This is part of minimizing to the system tray instead of exiting the application.
        Hide();

        // Attempt to set the taskbar icon to indicate the application is still running.
        if (!taskBarIcon->SetIcon(wxIcon("Icon.ico", wxBITMAP_TYPE_ICO), "Activity Tracker Running")) {
            // If setting the taskbar icon fails 
            wxMessageBox("Could not set the taskbar icon.");
        }

        // Veto the close event, which stops the window from closing and keeps
        // the application running in the background.
        event.Veto();
    }
    else {
        // If the event cannot be vetoed, it means the application is being asked to close
        // by the system (e.g., system shutdown). In this case, proceed with destroying
        // the window to allow the application to close gracefully.
        Destroy(); // we can't veto
    }
}

void MainFrame::OnIconize(wxIconizeEvent& event) {
    // When the window is iconized (minimized), hide it to not show in the taskbar
    if (event.IsIconized()) {
        Hide();
    }
}

void MainFrame::OnRestore(wxCommandEvent& event) {
    Show(true);
    taskBarIcon->RemoveIcon();
}

void MainFrame::OnTaskBarIconClick(wxTaskBarIconEvent& event) {
    Show(true); // Make the MainFrame window visible
    // taskBarIcon->RemoveIcon();
}

void MainFrame::OnExit(wxCommandEvent& event) {
    Close(true);
}