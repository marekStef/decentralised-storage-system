#include "WindowsAppsInfoThread.hpp"
#include "ConfigManager.hpp"

#include "WindowsAppsInfoManager.hpp"
#include "windowsAppsInfoNetworkHelpers.hpp"

#include "JsonHelpers.hpp"
#include "nlohmann/json.hpp"

#include "timeHelpers.hpp"
#include "generalHelpers.hpp"

#include <wx/thread.h>
#include <wx/utils.h>

WindowsAppsInfoThread::WindowsAppsInfoThread(ConfigManager& configManager)
    : wxThread(wxTHREAD_DETACHED), configManager(configManager) {}

WindowsAppsInfoThread::~WindowsAppsInfoThread() {

}

void saveAllCurrentlyOpenedWindowsInfo(const wxString& appsInfoDir) {
    wxString fileName = getCurrentTimeInIso() + ".json";
    wxFileName filePath(appsInfoDir, fileName);
    saveCurrentWindowsInfoToFile(filePath.GetFullPath().ToStdString(), GetCurrentISODate());
    // wxMessageBox("Finished exporting to" + filePath.GetFullPath().ToStdString(), "Alert", wxOK | wxICON_INFORMATION);
}

void PeriodicDataGatheringFunction(const ConfigManager& configManager) {
    auto appsInfoDir = configManager.GetDirectoryForAppsInfo();
    if (appsInfoDir.length() == 0) {
        return;
    }

    saveAllCurrentlyOpenedWindowsInfo(appsInfoDir);

    tryToSendUnsynchronisedEventsFilesToDataStorageServer(
        configManager.GetServerAddress().ToStdString(),
        configManager.GetServerPort().ToStdString(),
        configManager.GetActivityTrackerEventAccessToken().ToStdString(),
        appsInfoDir.ToStdString()
    );

    /*wxDateTime currentTime = wxDateTime::Now();
    wxString timeString = currentTime.Format("%Y-%m-%d %H:%M:%S");
    lastRunTimeDisplay->SetLabel(wxString::Format("Last run: %s", timeString));*/
}

wxThread::ExitCode WindowsAppsInfoThread::Entry() {
    //ScreenshotsManager screenshotsManager;

    while (!TestDestroy()) {
        PeriodicDataGatheringFunction(configManager);

        int intervalInMilliseconds = configManager.GetPeriodicityForFetchingAppsInfo();

        int checkInterval = 1000; // Check every second
        int sleptTime = 0;

        // Sleep in smaller periods to check for destruction request 
        // (i needed to add it here instead of directly sleeping for intervalInMilliseconds because when the app wanted to stop this thread, this thread took too long to respond)
        while (sleptTime < intervalInMilliseconds && !TestDestroy()) {
            wxThread::Sleep(checkInterval);
            sleptTime += checkInterval;
        }

        if (TestDestroy())
            break;
    }

    return (wxThread::ExitCode)0;
}