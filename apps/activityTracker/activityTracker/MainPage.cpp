#include <wx/filename.h>

#include "constants.hpp"

#include "MainPage.hpp"
#include "JsonHelpers.hpp"
#include "nlohmann/json.hpp"

#include "timeHelpers.hpp"

#include "WindowsAppsInfoThread.hpp"
#include "ScreenshotsThread.hpp"
#include "KeyPressesManager.hpp"

MainPage::MainPage(wxNotebook* parent, ConfigManager& configManager, std::function<void()> closeAppFunction) 
    : wxScrolledWindow(parent), configManager(configManager), timer(new wxTimer(this)), forceCloseApp(closeAppFunction) {
    setupUI();

    keyPressesManager = KeyPressesManager::CreateManagerInstance();
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
    toggleGatheringWindowsAppsInfoButton = new wxButton(this, wxID_ANY, "Start Windows Apps Info Gathering");
    windowsOpenedAppsSizer->Add(toggleGatheringWindowsAppsInfoButton, 0, wxALIGN_CENTER | wxALL, 10);
    toggleGatheringWindowsAppsInfoButton->Bind(wxEVT_BUTTON, &MainPage::StartOpenedWindowsAppsGatheringButtonClick, this);

    /*lastRunTimeDisplay = new wxStaticText(this, wxID_ANY, "Last gathering time: Never Since The App's Start");
    windowsOpenedAppsSizer->Add(lastRunTimeDisplay, 0, wxALL, 5);*/

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
    gatheringKeypressesButton = new wxButton(this, wxID_ANY, "Start Gathering Key Presses");
    keyPressesGatheringSizer->Add(gatheringKeypressesButton, 0, wxALIGN_CENTER | wxALL, 10);
    gatheringKeypressesButton->Bind(wxEVT_BUTTON, &MainPage::StartGatheringKeyPressesButtonClick, this);
    sizer->Add(keyPressesGatheringSizer, 0, wxEXPAND | wxALL, 10);


    wxButton* exitAppButton = new wxButton(this, wxID_ANY, wxT("EXIT APP"));
    sizer->Add(exitAppButton, 0, wxALIGN_CENTER | wxBOTTOM, 10);
    exitAppButton->Bind(wxEVT_BUTTON, &MainPage::CloseApplication, this);

    this->SetSizer(sizer);
    this->Layout();
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

    if (!windowsAppsInfoThread || !windowsAppsInfoThread->IsRunning()) {
        windowsAppsInfoThread = new WindowsAppsInfoThread(configManager);
        if (windowsAppsInfoThread->Run() != wxTHREAD_NO_ERROR) {
            wxMessageBox("Failed to start the windows apps info gathering thread!", "Error", wxOK | wxICON_ERROR);
        }
        else {
            toggleGatheringWindowsAppsInfoButton->SetLabel("Stop Gathering Windows Apps Info");
        }
    }
    else {
        if (windowsAppsInfoThread) windowsAppsInfoThread->Delete();
        windowsAppsInfoThread = nullptr;
        toggleGatheringWindowsAppsInfoButton->SetLabel("Start Gathering Windows Apps Info");
    }
}

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
    if (!keyPressesManager) return;

    if (isKeyPressesLoggingRunning) {
        isKeyPressesLoggingRunning = false;
        keyPressesManager->End();
        gatheringKeypressesButton->SetLabel("Start Gathering Key Presses");
    }
    else {
        isKeyPressesLoggingRunning = true;
        keyPressesManager->Start(configManager.GetDirectoryForKeyPresses() / (GetCurrentDateForPath() + ".txt"));
        gatheringKeypressesButton->SetLabel("Stop Gathering Key Presses");
    }
}