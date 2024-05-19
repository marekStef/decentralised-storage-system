#ifndef _CUSTOM_PAGE_HPP_
#define _CUSTOM_PAGE_HPP_

#include <wx/wx.h>
#include "wx/notebook.h"

#include "ConfigManager.hpp"

class CustomPage : public wxScrolledWindow {
public:
    CustomPage(wxNotebook* parent)
        : wxScrolledWindow(parent) {}
    virtual void OnTabChanged() = 0;
};

#endif // _CUSTOM_PAGE_HPP_