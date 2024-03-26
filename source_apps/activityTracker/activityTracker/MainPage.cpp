#include <wx/filename.h>

#include "MainPage.hpp"
#include "WindowsAppsInfoManager.hpp"
#include "generalHelpers.hpp"

#include "windowsAppsInfoNetworkHelpers.hpp"
#include "JsonHelpers.hpp"
#include "nlohmann/json.hpp"

MainPage::MainPage(wxNotebook* parent, ConfigManager& configManager) : wxScrolledWindow(parent), configManager(configManager) {
    setupUI();
}

void MainPage::setupUI() {
    this->SetScrollbars(20, 10, 50, 100);
    this->SetTransparent(245);

    wxBoxSizer* sizer = new wxBoxSizer(wxVERTICAL);

    sizer->Add(new wxStaticText(this, wxID_ANY, "Main Page"), 0, wxALL, 5);

    wxButton* fetchAllAppsButton = new wxButton(this, wxID_ANY, wxT("Fetch All Apps Info"));
    sizer->Add(fetchAllAppsButton, 0, wxALIGN_CENTER | wxBOTTOM, 10);
    fetchAllAppsButton->Bind(wxEVT_BUTTON, &MainPage::OnFetchAllWindowsAppsInfoButtonClick, this);

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