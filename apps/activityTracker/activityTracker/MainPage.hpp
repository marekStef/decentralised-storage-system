#ifndef MAIN_PAGE_HPP
#define MAIN_PAGE_HPP

#include <functional>
#include <wx/wx.h>
#include "wx/notebook.h"
#include <memory>

#include "ConfigManager.hpp"
#include "ScreenshotsThread.hpp"
#include "KeyPressesManager.hpp"
#include "WindowsAppsInfoThread.hpp"
#include "NetworkManager.hpp"

class MainPage : public wxScrolledWindow {
public:
    MainPage(wxNotebook* parent, ConfigManager& configManager, std::function<void()> closeAppFunction);
    ~MainPage();
private:
    ConfigManager& configManager;
    std::function<void()> forceCloseApp;

    void setupUI();
    void loadData();

    void CloseApplication(wxCommandEvent& event);

    wxStaticText* lastRunTimeDisplay;

    wxTimer* timer; // Timer to trigger the periodic execution function of fetching info about windows apps

    // windows apps info related
    void StartOpenedWindowsAppsGatheringButtonClick(wxCommandEvent& event);
    wxButton* toggleGatheringWindowsAppsInfoButton;
    WindowsAppsInfoThread* windowsAppsInfoThread = nullptr;

    // screenshots related
    void StartGatheringScreenshotsButtonClick(wxCommandEvent& event);
    ScreenshotsThread* screenshotsThread = nullptr;
    wxButton* startGatheringScreenshotsButton;

    // keypresses related
    bool isKeyPressesLoggingRunning = false;
    wxButton* gatheringKeypressesButton;
    std::shared_ptr<KeyPressesManager> keyPressesManager;
    void StartGatheringKeyPressesButtonClick(wxCommandEvent& event);

    // network ssids related
    wxListBox* ssidList;

};

#endif // MAIN_PAGE_HPP