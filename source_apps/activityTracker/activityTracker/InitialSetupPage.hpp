#ifndef INITIAL_SETUP_PAGE_HPP
#define INITIAL_SETUP_PAGE_HPP

#include <wx/wx.h>
#include "wx/notebook.h"

#include "ConfigManager.hpp"

class InitialSetupPage : public wxScrolledWindow {
public:
    InitialSetupPage(wxNotebook* parent, ConfigManager& configManager);
private:
    ConfigManager& configManager;

    void setupUI();


    wxTextCtrl* serverAddressInputField;
    wxTextCtrl* serverPortInputField;

    wxStaticText* directoryDisplay;
    wxString defaultDirectory;

    void OnSaveButtonClick(wxCommandEvent& event);
    void OnSelectDirectoryClick(wxCommandEvent& event);
    void LoadConfig();

    wxStaticText* lastRunTimeDisplay;

    wxTimer* timer; // Timer to trigger the periodic execution function

    void OnAlertButtonClick(wxCommandEvent& event);
    void PeriodicDataGatheringFunction();
    void startPeriodicDataGathering();
};

#endif // INITIAL_SETUP_PAGE_HPP