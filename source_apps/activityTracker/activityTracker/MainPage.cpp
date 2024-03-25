#include "MainPage.hpp"

MainPage::MainPage(wxNotebook* parent, ConfigManager& configManager) : wxScrolledWindow(parent), configManager(configManager) {
    setupUI();
}

void MainPage::setupUI() {
    this->SetScrollbars(20, 10, 50, 100);
    this->SetTransparent(245);

    wxBoxSizer* sizer = new wxBoxSizer(wxVERTICAL);

    sizer->Add(new wxStaticText(this, wxID_ANY, "Main Page"), 0, wxALL, 5);

    wxButton* exitAppButton = new wxButton(this, wxID_ANY, wxT("Exit App"));
    sizer->Add(exitAppButton, 0, wxALIGN_CENTER | wxBOTTOM, 10);
    exitAppButton->Bind(wxEVT_BUTTON, &MainPage::CloseApplication, this);

    this->SetSizer(sizer); // set the sizer for this to arrange its children
    this->Layout(); // This ensures the layout is recalculated
}

void MainPage::CloseApplication(wxCommandEvent& event) {
    // Navigate up the hierarchy to find the MainFrame
    wxWindow* parent = this->GetParent();
    if (parent) {
        wxWindow* grandParent = parent->GetParent();
        if (grandParent) {
            grandParent->Close(true);
        }
    }
}