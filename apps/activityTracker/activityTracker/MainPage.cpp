#include <wx/filename.h>

#include "constants.hpp"

#include "MainPage.hpp"
#include "WindowsAppsInfoManager.hpp"
#include "generalHelpers.hpp"

#include "windowsAppsInfoNetworkHelpers.hpp"
#include "JsonHelpers.hpp"
#include "nlohmann/json.hpp"

#include "timeHelpers.hpp"

#include "ScreenshotsThread.hpp"
#include "KeyPressesManager.hpp"

MainPage::MainPage(wxNotebook* parent, ConfigManager& configManager, std::function<void()> closeAppFunction) 
    : wxScrolledWindow(parent), configManager(configManager), timer(new wxTimer(this)), forceCloseApp(closeAppFunction) {
    setupUI();

    // bind timer event
    this->Bind(wxEVT_TIMER, [this](wxTimerEvent& event) { this->PeriodicDataGatheringFunction(); }, timer->GetId());
}

MainPage::~MainPage() {
    if (screenshotsThread && screenshotsThread->IsRunning()) {
        screenshotsThread->Delete(); // to properly stop the screenshots thread
    }
    keyPressesManager->End();
}

void MainPage::setupUI() {
    this->SetScrollbars(20, 10, 50, 100);
    this->SetTransparent(245);

    wxBoxSizer* sizer = new wxBoxSizer(wxVERTICAL);

    wxStaticBoxSizer* windowsOpenedAppsSizer = new wxStaticBoxSizer(wxVERTICAL, this, "Windows opened apps info gathering");
    wxButton* openedWindowsAppsGatheringButton = new wxButton(this, wxID_ANY, "Start Windows Apps Info Gathering");
    windowsOpenedAppsSizer->Add(openedWindowsAppsGatheringButton, 0, wxALIGN_CENTER | wxALL, 10);
    openedWindowsAppsGatheringButton->Bind(wxEVT_BUTTON, &MainPage::StartOpenedWindowsAppsGatheringButtonClick, this);

    wxButton* fetchAllAppsButton = new wxButton(this, wxID_ANY, wxT("Fetch All Apps Info Now Manually"));
    windowsOpenedAppsSizer->Add(fetchAllAppsButton, 0, wxALIGN_CENTER | wxBOTTOM, 10);
    fetchAllAppsButton->Bind(wxEVT_BUTTON, &MainPage::OnFetchAllWindowsAppsInfoButtonClick, this);

    lastRunTimeDisplay = new wxStaticText(this, wxID_ANY, "Last gathering time: Never Since The App's Start");
    windowsOpenedAppsSizer->Add(lastRunTimeDisplay, 0, wxALL, 5);

    sizer->Add(windowsOpenedAppsSizer, 0, wxEXPAND | wxALL, 10);

    wxStaticBoxSizer* screenshotsGatheringSizer = new wxStaticBoxSizer(wxVERTICAL, this, "Screenshots Gathering");
    auto screenshotsGeneralInformationText = new wxStaticText(
        this, 
        wxID_ANY, 
        "Screenshots Gathering works without the app being set up with the storage system.\nJust set periodicity and screenshots dir in the settings."
    );
    screenshotsGatheringSizer->Add(screenshotsGeneralInformationText, 0, wxALL, 5);
    startGatheringScreenshotsButton = new wxButton(this, wxID_ANY, "Start Gathering Screenshots");
    screenshotsGatheringSizer->Add(startGatheringScreenshotsButton, 0, wxALIGN_CENTER | wxALL, 10);
    startGatheringScreenshotsButton->Bind(wxEVT_BUTTON, &MainPage::StartGatheringScreenshotsButtonClick, this);
    sizer->Add(screenshotsGatheringSizer, 0, wxEXPAND | wxALL, 10);


    wxStaticBoxSizer* keyPressesGatheringSizer = new wxStaticBoxSizer(wxVERTICAL, this, "KeyPresses Gathering");
    wxButton* startGatheringKeyPressesButton = new wxButton(this, wxID_ANY, "Start Gathering Key Presses");
    keyPressesGatheringSizer->Add(startGatheringKeyPressesButton, 0, wxALIGN_CENTER | wxALL, 10);
    startGatheringKeyPressesButton->Bind(wxEVT_BUTTON, &MainPage::StartGatheringKeyPressesButtonClick, this);
    sizer->Add(keyPressesGatheringSizer, 0, wxEXPAND | wxALL, 10);


    wxButton* exitAppButton = new wxButton(this, wxID_ANY, wxT("EXIT APP"));
    sizer->Add(exitAppButton, 0, wxALIGN_CENTER | wxBOTTOM, 10);
    exitAppButton->Bind(wxEVT_BUTTON, &MainPage::CloseApplication, this);

    this->SetSizer(sizer);
    this->Layout();
}

void saveAllCurrentlyOpenedWindowsInfo(const wxString& appsInfoDir) {
    wxString fileName = getCurrentTimeInIso() + ".json";
    wxFileName filePath(appsInfoDir, fileName);
    saveCurrentWindowsInfoToFile(filePath.GetFullPath().ToStdString(), GetCurrentISODate());
    wxMessageBox("Finished exporting to" + filePath.GetFullPath().ToStdString(), "Alert", wxOK | wxICON_INFORMATION);
}

void MainPage::OnFetchAllWindowsAppsInfoButtonClick(wxCommandEvent& event) {
    auto appsInfoDir = configManager.GetDirectoryForAppsInfo();
    if (appsInfoDir.length() == 0) {
        wxMessageBox("You need to set default directory first in the settings", "Alert", wxOK | wxICON_INFORMATION);
        return;
    }
    
    saveAllCurrentlyOpenedWindowsInfo(appsInfoDir);
}

void MainPage::CloseApplication(wxCommandEvent& event) {
    forceCloseApp();
}

void MainPage::StartOpenedWindowsAppsGatheringButtonClick(wxCommandEvent& event) {
    if (!configManager.IsAppProperlySetUp()) {
        wxMessageBox("Your app is not properly set up. Either set it up or reset it", "Alert", wxOK | wxICON_INFORMATION);
        return;
    }

    if (configManager.GetDirectoryForAppsInfo().IsEmpty()) {
        wxMessageBox("You need to set directory where data for this app will be saved first in the settings", "Alert", wxOK | wxICON_INFORMATION);
        return;
    }

    startPeriodicDataGathering();
}

void MainPage::PeriodicDataGatheringFunction() { // wxTimerEvent& event
    auto appsInfoDir = configManager.GetDirectoryForAppsInfo();
    if (appsInfoDir.length() == 0) {
        return;
    }

    saveAllCurrentlyOpenedWindowsInfo(appsInfoDir);

    tryToSendUnsynchronisedEventsFilesToDataStorageServer(
        configManager.GetServerAddress().ToStdString(),
        configManager.GetServerPort().ToStdString(),
        configManager.GetActivityTrackerEventAccessToken().ToStdString(),
        appsInfoDir.ToStdString()
    );

    wxDateTime currentTime = wxDateTime::Now();
    wxString timeString = currentTime.Format("%Y-%m-%d %H:%M:%S");
    lastRunTimeDisplay->SetLabel(wxString::Format("Last run: %s", timeString));
}

void MainPage::startPeriodicDataGathering() {
    PeriodicDataGatheringFunction();
    timer->Start(configManager.GetPeriodicityForFetchingAppsInfo());
}

//void MainPage::StartGatheringScreenshotsButtonClick(wxCommandEvent& event) {
//    auto screenshotsDir = configManager.GetDirectoryForScreenshots();
//    if (screenshotsDir.length() == 0) {
//        return;
//    }
//    wxMessageBox(screenshotsDir, "Alert", wxOK | wxICON_INFORMATION);
//    ScreenshotsManager screenshots_manager(screenshotsDir.ToStdString());
//    screenshots_manager.take_screenshots_of_all_screens();
//}

//void MainPage::StartGatheringScreenshotsButtonClick(wxCommandEvent& event) {
//    auto screenshotsDir = configManager.GetDirectoryForScreenshots();
//    if (screenshotsDir.length() == 0) {
//        wxMessageBox("You need to set directory where screenshots will be saved first in the settings", "Alert", wxOK | wxICON_INFORMATION);
//        return;
//    }
//
//    ScreenshotsThread* thread = new ScreenshotsThread(configManager);
//    if (thread->Run() != wxTHREAD_NO_ERROR) {
//        wxMessageBox("Failed to start the screenshots gathering thread!", "Error", wxOK | wxICON_ERROR);
//    }
//}

void MainPage::StartGatheringScreenshotsButtonClick(wxCommandEvent& event) {
    auto screenshotsDir = configManager.GetDirectoryForScreenshots();
    if (screenshotsDir.length() == 0) {
        wxMessageBox("You need to set directory where screenshots will be saved first in the settings", "Alert", wxOK | wxICON_INFORMATION);
        return;
    }

    if (!screenshotsThread || !screenshotsThread->IsRunning()) {
        screenshotsThread = new ScreenshotsThread(configManager);
        if (screenshotsThread->Run() != wxTHREAD_NO_ERROR) {
            wxMessageBox("Failed to start the screenshots gathering thread!", "Error", wxOK | wxICON_ERROR);
        }
        else {
            startGatheringScreenshotsButton->SetLabel("Stop Gathering Screenshots");
        }
    }
    else {
        if (screenshotsThread) screenshotsThread->Delete();
        screenshotsThread = nullptr;
        startGatheringScreenshotsButton->SetLabel("Start Gathering Screenshots");
    }
}

void MainPage::StartGatheringKeyPressesButtonClick(wxCommandEvent& event) {
    keyPressesManager = KeyPressesManager::CreateManagerInstance();
    keyPressesManager->Start(configManager.GetDirectoryForKeyPresses());
}