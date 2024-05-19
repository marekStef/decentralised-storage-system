#ifndef _MAIN_FRAME_HPP
#define _MAIN_FRAME_HPP

#include "ConfigManager.hpp"

#include <wx/wx.h>
#include <wx/textctrl.h>
#include <wx/button.h>
#include <wx/filedlg.h>
#include <wx/fileconf.h>
#include <wx/taskbar.h>
#include <memory>

#include "ExistingSetupPage.hpp"
#include "InitialSetupPage.hpp"
#include "SettingsPage.hpp"
#include "MainPage.hpp"

#include "wx/notebook.h"

class MainFrame : public wxFrame {
public:
    MainFrame(const wxString& title, ConfigManager& configManager);

private:
    void setupUI();

    ConfigManager& configManager;
    void ForceClose();

    // task bar related [start]

    wxTaskBarIcon* taskBarIcon; // Taskbar icon for minimizing to tray
    wxNotebook* notebook;

    std::unique_ptr<InitialSetupPage> initialSetupPage;
    std::unique_ptr<ExistingSetupPage> existingSetupPage;
    std::unique_ptr<SettingsPage> settingsPage;
    std::unique_ptr<MainPage> mainPage;

    void OnTabChanged(wxBookCtrlEvent& event);

    void OnClose(wxCloseEvent& event);
    void OnIconize(wxIconizeEvent& event);
    void OnRestore(wxCommandEvent& event);
    void OnExit(wxCommandEvent& event);
    void OnTaskBarIconClick(wxTaskBarIconEvent& event);

    DECLARE_EVENT_TABLE()

    // task bar related [end]
};

// Define custom event IDs
enum {
    ID_Restore = wxID_HIGHEST + 1,
    ID_Exit
};


#endif // !_MAIN_FRAME_HPP

