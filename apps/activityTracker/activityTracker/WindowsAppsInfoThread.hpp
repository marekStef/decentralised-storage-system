#ifndef _WINDOWS_APPS_INFO_THREAD_HPP_
#define _WINDOWS_APPS_INFO_THREAD_HPP_

#include "ConfigManager.hpp"
#include <wx/thread.h>

class WindowsAppsInfoThread : public wxThread {
public:
    WindowsAppsInfoThread(ConfigManager& configManager);
    virtual ~WindowsAppsInfoThread() override;
protected:
    virtual wxThread::ExitCode Entry() override;
private:
    ConfigManager& configManager;
};

#endif // !_WINDOWS_APPS_INFO_THREAD_HPP_
