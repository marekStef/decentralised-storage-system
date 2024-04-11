#ifndef _WINDOW_INFO_HPP_
#define _WINDOW_INFO_HPP_

#include <windows.h>
#include <string>

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

#endif // !_WINDOW_INFO_HPP_
