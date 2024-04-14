#include "ScreenshotsThread.hpp"
#include "ConfigManager.hpp"
#include "ScreenshotsManager.hpp"

#include <wx/thread.h>
#include <wx/utils.h>

ScreenshotsThread::ScreenshotsThread(ConfigManager& configManager)
        : wxThread(wxTHREAD_DETACHED), configManager(configManager) {}

ScreenshotsThread::~ScreenshotsThread() {

}

//wxThread::ExitCode ScreenshotsThread::Entry()  {
//    ScreenshotsManager screenshotsManager;
//
//    while (!TestDestroy()) {
//        screenshotsManager.takeScreenshotsOfAllScreens(configManager.GetDirectoryForScreenshots().ToStdString());
//        int intervalInMilliseconds = configManager.GetPeriodicityForScreenshots();
//        wxThread::Sleep(intervalInMilliseconds);
//    }
//
//    return (wxThread::ExitCode)0; // successfull completion
//}

wxThread::ExitCode ScreenshotsThread::Entry() {
    ScreenshotsManager screenshotsManager;

    while (!TestDestroy()) {
        screenshotsManager.takeScreenshotsOfAllScreens(configManager.GetDirectoryForScreenshots().ToStdString());

        int intervalInMilliseconds = configManager.GetPeriodicityForScreenshots();

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

    return (wxThread::ExitCode)0; // Successful completion
}