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




#endif // !_MAIN_APP_HPP