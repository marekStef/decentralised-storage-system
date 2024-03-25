#ifndef _GENERAL_HELPERS_HPP_
#define _GENERAL_HELPERS_HPP_

#include <wx/datetime.h>
#include <wx/filename.h>

wxString getCurrentTimeInIso() {
    wxDateTime now = wxDateTime::Now();
    wxString dateTimeStr = now.FormatISODate() + "_" + now.FormatISOTime();
    dateTimeStr.Replace(":", "-", true);

    return dateTimeStr;
}

#endif // !_GENERAL_HELPERS_HPP_
