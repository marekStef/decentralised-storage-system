#ifndef MAIN_PAGE_HPP
#define MAIN_PAGE_HPP

#include <wx/wx.h>
#include "wx/notebook.h"

#include "ConfigManager.hpp"

class MainPage : public wxScrolledWindow {
public:
    MainPage(wxNotebook* parent, ConfigManager& configManager);
private:
    ConfigManager& configManager;

    void setupUI();

    void OnFetchAllWindowsAppsInfoButtonClick(wxCommandEvent& event);

    void CloseApplication(wxCommandEvent& event);

    wxStaticText* lastRunTimeDisplay;

    wxTimer* timer; // Timer to trigger the periodic execution function

    void StartOpenedWindowsAppsGatheringButtonClick(wxCommandEvent& event);
    void PeriodicDataGatheringFunction();
    void startPeriodicDataGathering();
};

#endif // MAIN_PAGE_HPP