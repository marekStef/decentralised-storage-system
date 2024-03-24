#ifndef _MAIN_FRAME_HPP
#define _MAIN_FRAME_HPP

#include "ConfigManager.hpp"

#include <wx/wx.h>
#include <wx/textctrl.h>
#include <wx/button.h>
#include <wx/filedlg.h>
#include <wx/fileconf.h>

class MainFrame : public wxFrame {
public:
    MainFrame(const wxString& title, ConfigManager& configManager);

private:
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
};

#endif // !_MAIN_FRAME_HPP

