#ifndef SETTINGS_PAGE_HPP
#define SETTINGS_PAGE_HPP

#include <wx/wx.h>
#include "wx/notebook.h"

#include "ConfigManager.hpp"

class SettingsPage : public wxScrolledWindow {
public:
    SettingsPage(wxNotebook* parent, ConfigManager& configManager);
private:
    ConfigManager& configManager;

    void setupUI();
};

#endif // SETTINGS_PAGE_HPP