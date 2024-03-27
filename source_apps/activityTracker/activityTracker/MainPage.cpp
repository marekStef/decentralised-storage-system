#include <wx/filename.h>

#include "constants.hpp"

#include "MainPage.hpp"
#include "WindowsAppsInfoManager.hpp"
#include "generalHelpers.hpp"

#include "windowsAppsInfoNetworkHelpers.hpp"
#include "JsonHelpers.hpp"
#include "nlohmann/json.hpp"

MainPage::MainPage(wxNotebook* parent, ConfigManager& configManager) : wxScrolledWindow(parent), configManager(configManager), timer(new wxTimer(this)) {
    setupUI();

    // bind timer event
    this->Bind(wxEVT_TIMER, [this](wxTimerEvent& event) { this->PeriodicDataGatheringFunction(); }, timer->GetId());
}

void MainPage::setupUI() {
    this->SetScrollbars(20, 10, 50, 100);
    this->SetTransparent(245);

    wxBoxSizer* sizer = new wxBoxSizer(wxVERTICAL);

    sizer->Add(new wxStaticText(this, wxID_ANY, "Main Page"), 0, wxALL, 5);

    wxButton* fetchAllAppsButton = new wxButton(this, wxID_ANY, wxT("Fetch All Apps Info"));
    sizer->Add(fetchAllAppsButton, 0, wxALIGN_CENTER | wxBOTTOM, 10);
    fetchAllAppsButton->Bind(wxEVT_BUTTON, &MainPage::OnFetchAllWindowsAppsInfoButtonClick, this);

    wxButton* openedWindowsAppsGatheringButton = new wxButton(this, wxID_ANY, "Start Windows Apps Info Gathering");
    sizer->Add(openedWindowsAppsGatheringButton, 0, wxALIGN_CENTER | wxALL, 10);
    openedWindowsAppsGatheringButton->Bind(wxEVT_BUTTON, &MainPage::StartOpenedWindowsAppsGatheringButtonClick, this);

    lastRunTimeDisplay = new wxStaticText(this, wxID_ANY, "Last run: Never");
    sizer->Add(lastRunTimeDisplay, 0, wxALIGN_CENTER | wxALL, 5);

    wxButton* exitAppButton = new wxButton(this, wxID_ANY, wxT("EXIT APP"));
    sizer->Add(exitAppButton, 0, wxALIGN_CENTER | wxBOTTOM, 10);
    exitAppButton->Bind(wxEVT_BUTTON, &MainPage::CloseApplication, this);

    this->SetSizer(sizer); // set the sizer for this to arrange its children
    this->Layout(); // This ensures the layout is recalculated
}

void MainPage::OnFetchAllWindowsAppsInfoButtonClick(wxCommandEvent& event) {
    auto appsInfoDir = configManager.GetDirectoryForAppsInfo();
    if (appsInfoDir.length() == 0) {
        wxMessageBox("You need to set default directory first in the settings", "Alert", wxOK | wxICON_INFORMATION);
        return;
    }
    wxString fileName = getCurrentTimeInIso() + ".json";
    wxFileName filePath(appsInfoDir, fileName);
    
    //saveWindowsInfoToFile(filePath.GetFullPath().ToStdString());

    auto windows_manager = WindowsAppsInfoManager();
    auto windowsInfo = windows_manager.get_windows_info();

    json jsonResult = serializeWindowsInfoToJson(windowsInfo);

    saveJsonToFile(jsonResult, filePath.GetFullPath().ToStdString());

    wxMessageBox("Finished exporting to" + filePath.GetFullPath(), "Alert", wxOK | wxICON_INFORMATION);
}

void MainPage::CloseApplication(wxCommandEvent& event) {
    // Navigate up the hierarchy to find the MainFrame
    wxWindow* parent = this->GetParent();
    if (parent) {
        wxWindow* grandParent = parent->GetParent();
        if (grandParent) {
            grandParent->Close(true);
        }
    }
}

void MainPage::StartOpenedWindowsAppsGatheringButtonClick(wxCommandEvent& event) {
    if (!configManager.IsAppProperlySetUp()) {
        wxMessageBox("Your app is not properly set up. Either set it up or reset it", "Alert", wxOK | wxICON_INFORMATION);
        return;
    }
    startPeriodicDataGathering();
}

void MainPage::PeriodicDataGatheringFunction() { // wxTimerEvent& event
    wxDateTime currentTime = wxDateTime::Now();
    wxString timeString = currentTime.Format("%Y-%m-%d %H:%M:%S");

    lastRunTimeDisplay->SetLabel(wxString::Format("Last run: %s", timeString));

    wxMessageBox("Time to check!", "Alert", wxOK | wxICON_INFORMATION);
}

void MainPage::startPeriodicDataGathering() {
    PeriodicDataGatheringFunction();
    timer->Start(PERIODIC_FUNCTION_INTERVAL_IN_MILLISECONDS);
}