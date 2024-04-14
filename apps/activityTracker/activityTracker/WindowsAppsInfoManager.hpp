#ifndef _WINDOWS_APPS_INFO_
#define _WINDOWS_APPS_INFO_

#include <windows.h>
#include <psapi.h> // For GetModuleFileNameEx
#include <iostream>
#include <vector>
#include <set>

#include <ostream>

#include "WindowInfo.hpp"

std::wostream& operator<<(std::wostream& os, const WindowInfo& window_info);

class WindowsAppsInfoManager {
public:
    std::vector<WindowInfo> getWindowsInfo();
};

void saveWindowsInfoToFile(const std::string& file_path);

#endif // !_WINDOWS_APPS_INFO_
