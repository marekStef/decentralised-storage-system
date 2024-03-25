#ifndef _MAIN_APP_HPP
#define _MAIN_APP_HPP

#include "MainFrame.hpp"
#include "ConfigManager.hpp"

#include <wx/wx.h>

class MyApp : public wxApp {
public:
    virtual bool OnInit();
private:
    ConfigManager configManager;
};

wxIMPLEMENT_APP(MyApp);

bool MyApp::OnInit() {
    configManager = ConfigManager();

    MainFrame* frame = new MainFrame("Activity Tracker", configManager);
    frame->Show(true);

    return true;
}

#endif // !_MAIN_APP_HPP

