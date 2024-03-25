#ifndef INITIAL_SETUP_PAGE_HPP
#define INITIAL_SETUP_PAGE_HPP

#include <wx/wx.h>
#include "wx/notebook.h"

class InitialSetupPage : public wxScrolledWindow {
public:
    InitialSetupPage(wxNotebook* parent);

private:
    void setupUI(wxNotebook* parent);
};

#endif // INITIAL_SETUP_PAGE_HPP