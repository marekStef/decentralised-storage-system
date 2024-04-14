#ifndef MAIN_PAGE_HPP
#define MAIN_PAGE_HPP

#include <functional>
#include <wx/wx.h>
#include "wx/notebook.h"
#include <memory>

#include "ConfigManager.hpp"
#include "ScreenshotsThread.hpp"
#include "KeyPressesManager.hpp"

class MainPage : public wxScrolledWindow {
public:
    MainPage(wxNotebook* parent, ConfigManager& configManager, std::function<void()> closeAppFunction);
    ~MainPage();
private:
    ConfigManager& configManager;
    std::function<void()> forceCloseApp;

    void setupUI();

    void OnFetchAllWindowsAppsInfoButtonClick(wxCommandEvent& event);

    void CloseApplication(wxCommandEvent& event);

    wxStaticText* lastRunTimeDisplay;

    wxTimer* timer; // Timer to trigger the periodic execution function of fetching info about windows apps

    void StartOpenedWindowsAppsGatheringButtonClick(wxCommandEvent& event);
    void StartGatheringScreenshotsButtonClick(wxCommandEvent& event);
    void PeriodicDataGatheringFunction();
    void startPeriodicDataGathering();

    // screenshots related
    ScreenshotsThread* screenshotsThread = nullptr;
    wxButton* startGatheringScreenshotsButton;

    // keypresses related
    wxButton* gatheringKeypressesButton;
    std::shared_ptr<KeyPressesManager> keyPressesManager;
    void StartGatheringKeyPressesButtonClick(wxCommandEvent& event);

};

#endif // MAIN_PAGE_HPP