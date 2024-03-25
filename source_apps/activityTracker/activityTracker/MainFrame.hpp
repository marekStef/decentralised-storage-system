#ifndef _MAIN_FRAME_HPP
#define _MAIN_FRAME_HPP

#include "ConfigManager.hpp"

#include <wx/wx.h>
#include <wx/textctrl.h>
#include <wx/button.h>
#include <wx/filedlg.h>
#include <wx/fileconf.h>
#include <wx/taskbar.h>
#include "wx/notebook.h"

class MainFrame : public wxFrame {
public:
    MainFrame(const wxString& title, ConfigManager& configManager);

private:
    void setupUI();
    void PageSetup(wxPanel* parent);
    void PageMain(wxPanel* parent);

    void OnSaveButtonClick(wxCommandEvent& event);
    void OnSelectDirectoryClick(wxCommandEvent& event);
    void LoadConfig();

    void OnAlertButtonClick(wxCommandEvent& event);
    void PeriodicDataGatheringFunction();

    void startPeriodicDataGathering();

    ConfigManager& configManager;

    wxTextCtrl* inputField;
    wxStaticText* directoryDisplay;
    wxString defaultDirectory;

    wxStaticText* lastRunTimeDisplay;

    wxTimer* timer; // Timer to trigger the periodic execution function

    // task bar related [start]

    wxTaskBarIcon* taskBarIcon; // Taskbar icon for minimizing to tray
    wxNotebook* notebook;

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

