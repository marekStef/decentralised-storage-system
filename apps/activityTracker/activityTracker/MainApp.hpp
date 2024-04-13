#ifndef _MAIN_APP_HPP
#define _MAIN_APP_HPP

#include <wx/wx.h>

#include "MainFrame.hpp"
#include "ConfigManager.hpp"

class MyApp : public wxApp {
public:
    virtual bool OnInit();
private:
    ConfigManager configManager;
};

#endif // !_MAIN_APP_HPP