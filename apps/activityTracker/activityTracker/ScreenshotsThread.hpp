#ifndef _SCREENSHOTS_THREAD_HPP_
#define _SCREENSHOTS_THREAD_HPP_

#include "ConfigManager.hpp"
#include <wx/thread.h>

class ScreenshotsThread : public wxThread {
public:
    ScreenshotsThread(ConfigManager& configManager);
    virtual ~ScreenshotsThread() override;
protected:
    virtual wxThread::ExitCode Entry() override;
private:
    ConfigManager& configManager;
};

#endif // !_SCREENSHOTS_THREAD_HPP_
