#include "MainFrame.hpp"
#include "ConfigManager.hpp"

#include "constants.hpp"
#include "InitialSetupPage.hpp"
#include "ExistingSetupPage.hpp"
#include "SettingsPage.hpp"
#include "MainPage.hpp"

#include <wx/wx.h>
#include <wx/textctrl.h>
#include <wx/button.h>
#include <wx/filedlg.h>
#include <wx/fileconf.h>
#include <wx/taskbar.h>
#include "wx/notebook.h"
#include <wx/scrolwin.h>

// Event table for handling window events
BEGIN_EVENT_TABLE(MainFrame, wxFrame)
    EVT_CLOSE(MainFrame::OnClose) // Handles the close event of the window.
    EVT_ICONIZE(MainFrame::OnIconize) // Handles the iconize event (when the window is minimized )
    EVT_MENU(ID_Restore, MainFrame::OnRestore) // Handles the menu event for restoring the window from the tray - not working at this moment
    EVT_MENU(ID_Exit, MainFrame::OnExit) // Handles the menu event for exiting the application.
    EVT_NOTEBOOK_PAGE_CHANGED(wxID_ANY, MainFrame::OnTabChanged) // Handles the tab change event.
END_EVENT_TABLE()



MainFrame::MainFrame(const wxString& title, ConfigManager& configManager)
    : wxFrame(NULL, wxID_ANY, title, wxDefaultPosition, wxSize(600, 400)), configManager(configManager), taskBarIcon(new wxTaskBarIcon()) {

    SetIcon(wxIcon("./Icon.ico", wxBITMAP_TYPE_ICO));
    taskBarIcon->Bind(wxEVT_TASKBAR_LEFT_UP, &MainFrame::OnTaskBarIconClick, this);

    setupUI();
}

void MainFrame::setupUI() {
    wxBoxSizer* mainSizer = new wxBoxSizer(wxVERTICAL);
    SetTransparent(245);

    notebook = new wxNotebook(this, wxID_ANY);

    initialSetupPage = std::make_unique<InitialSetupPage>(notebook, configManager);
    existingSetupPage = std::make_unique<ExistingSetupPage>(notebook, configManager);

    auto closeAppFunc = std::bind(&MainFrame::ForceClose, this); // Bind the ForceClose method of this MainFrame instance to a callable function object
    mainPage = std::make_unique<MainPage>(notebook, configManager, closeAppFunc);
    settingsPage = std::make_unique<SettingsPage>(notebook, configManager);

    bool isAppAlreadySetup = configManager.IsAppProperlySetUp();

    notebook->AddPage(initialSetupPage.get(), "Initial DataStorage Setup", !isAppAlreadySetup); // true to make it the selected tab
    notebook->AddPage(existingSetupPage.get(), "Existing DataStorage Setup");
    notebook->AddPage(settingsPage.get(), "Settings");
    notebook->AddPage(mainPage.get(), "Home", isAppAlreadySetup);

    mainSizer->Add(notebook, 1, wxEXPAND, 0);

    this->SetSizer(mainSizer);
    Layout();
}

void MainFrame::OnTabChanged(wxBookCtrlEvent& event) {
    wxWindow* currentPage = notebook->GetPage(event.GetSelection());
    CustomPage* customPage = dynamic_cast<CustomPage*>(currentPage);
    if (customPage) {
        customPage->OnTabChanged();
    }
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
        MessageBox(NULL, L"App is running and UI can be opened from Tray.", L"Info", MB_OK);
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
   /* if (event.IsIconized()) {
        Hide();
    }*/
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

void MainFrame::ForceClose() {
    Destroy();
}
