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
};

#endif // MAIN_PAGE_HPP