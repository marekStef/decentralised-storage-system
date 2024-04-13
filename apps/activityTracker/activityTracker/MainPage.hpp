#ifndef MAIN_PAGE_HPP
#define MAIN_PAGE_HPP

#include <functional>
#include <wx/wx.h>
#include "wx/notebook.h"

#include "ConfigManager.hpp"

class MainPage : public wxScrolledWindow {
public:
    MainPage(wxNotebook* parent, ConfigManager& configManager, std::function<void()> closeAppFunction);
private:
    ConfigManager& configManager;
    std::function<void()> forceCloseApp;

    void setupUI();

    void OnFetchAllWindowsAppsInfoButtonClick(wxCommandEvent& event);

    void CloseApplication(wxCommandEvent& event);

    wxStaticText* lastRunTimeDisplay;

    wxTimer* timer; // Timer to trigger the periodic execution function

    void StartOpenedWindowsAppsGatheringButtonClick(wxCommandEvent& event);
    void StartGatheringScreenshotsButtonClick(wxCommandEvent& event);
    void PeriodicDataGatheringFunction();
    void startPeriodicDataGathering();
};

#endif // MAIN_PAGE_HPP