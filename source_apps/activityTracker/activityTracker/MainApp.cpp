#include "MainApp.hpp"

#include "MainFrame.hpp"
#include "ConfigManager.hpp"

bool MyApp::OnInit() {
    configManager = ConfigManager();

    MainFrame* frame = new MainFrame("Activity Tracker", configManager);
    frame->Show(true);

    return true;
}


wxIMPLEMENT_APP(MyApp);
