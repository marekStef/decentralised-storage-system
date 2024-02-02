#ifndef _WINDOWS_APPS_INFO_
#define _WINDOWS_APPS_INFO_

#include <windows.h>
#include <psapi.h> // For GetModuleFileNameEx
#include <iostream>
#include <vector>
#include <set>

#include <ostream>

struct WindowInfo {
    DWORD processId;
    std::wstring title;
    std::wstring exe_name;
    std::wstring class_name;
    RECT dimensions;
    bool is_minimised;

    SIZE_T memory_usage;  // Memory usage in bytes
    std::wstring module_name;

    FILETIME creation_time, exit_time, kernel_time, user_time; // FILETIME represents the number of 100-nanosecond intervals since January 1, 1601 (UTC)
};

std::wostream& operator<<(std::wostream& os, const WindowInfo& window_info);

class WindowsAppsInfoManager {
public:
	std::vector<WindowInfo> get_windows_info();
};

#endif // !_WINDOWS_APPS_INFO_
