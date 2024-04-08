#include "ScreenshotsThread.hpp"
#include "ConfigManager.hpp"
#include "ScreenshotsManager.hpp"

#include <wx/thread.h>
#include <wx/utils.h> // sleep

ScreenshotsThread::ScreenshotsThread(ConfigManager& configManager, int intervalInMilliseconds)
        : wxThread(wxTHREAD_DETACHED), configManager(configManager), intervalInMilliseconds(intervalInMilliseconds) {}

ScreenshotsThread::~ScreenshotsThread() {

}

wxThread::ExitCode ScreenshotsThread::Entry()  {
    ScreenshotsManager screenshotsManager;

    while (!TestDestroy()) {
        screenshotsManager.take_screenshots_of_all_screens(configManager.GetDirectoryForScreenshots().ToStdString());
        wxThread::Sleep(intervalInMilliseconds);
    }

    return (wxThread::ExitCode)0; // successfull completion
}
