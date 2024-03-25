#include <windows.h>
#include <psapi.h> // For GetModuleFileNameEx
#include <iostream>
#include <vector>
#include <set>

#include <ostream>
#include <fstream>
#include <string>

#include <filesystem>

#include "WindowsAppsInfoManager.hpp"
#include "WindowInfo.hpp"

void saveWindowsInfoToFile(const std::string& file_path) {
    std::filesystem::path fs_path(file_path);

    std::filesystem::path parent_path = fs_path.parent_path();

    if (!parent_path.empty() && !std::filesystem::exists(parent_path)) {
        std::filesystem::create_directories(parent_path);
    }

    std::wofstream file_out(file_path, std::wofstream::out);

    if (!file_out) {
        std::cerr << "Failed to open file at " << file_path << std::endl;
        return; // Ensure we don't proceed if file couldn't be opened
    }

    auto windows_manager = WindowsAppsInfoManager();

    for (const auto& window : windows_manager.get_windows_info()) {
        file_out << window << std::endl; // Write to file instead of console
    }

    file_out << L"\n\n***********************************\n\n\n";

    file_out.close(); // Close the file to flush any remaining output
}

std::wostream& operator<<(std::wostream& os, const WindowInfo& window_info) {

    os << L"PID: " << window_info.processId << std::endl;
    os << L"Title: " << window_info.title << std::endl;
    os << L"Executable Name: " << window_info.exe_name << std::endl;
    os << L"Class Name: " << window_info.class_name << std::endl;
    os << L"Dimensions: " << L"Top: " << window_info.dimensions.top << L", Left: " << window_info.dimensions.left << L", Bottom: " << window_info.dimensions.bottom << L", Right: " << window_info.dimensions.right << std::endl;
    os << L"State: " << (window_info.is_minimised ? L"Minimized" : L"Normal/Maximized") << std::endl;
    os << L"Memory usage: " << window_info.memory_usage << std::endl;
    os << L"Module Name: " << window_info.module_name << std::endl;
    os << "-------------------------------------" << std::endl;

    // print time
    SYSTEMTIME stUTC, stLocal;
    FileTimeToSystemTime(&window_info.creation_time, &stUTC);
    SystemTimeToTzSpecificLocalTime(NULL, &stUTC, &stLocal);

    printf("Start Time: %02d/%02d/%d %02d:%02d\n", stLocal.wDay, stLocal.wMonth, stLocal.wYear, stLocal.wHour, stLocal.wMinute);

    return os;
}

DWORD get_window_title(const HWND& hwnd, WindowInfo& output_win) {
    WCHAR windowTitle[MAX_PATH];
    DWORD title_length = GetWindowTextW(hwnd, windowTitle, MAX_PATH);
    output_win.title = std::wstring(windowTitle);
    return title_length;
}

void get_process_class_name(const HWND& hwnd, WindowInfo& output_win) {
    WCHAR class_name[MAX_PATH];
    GetClassNameW(hwnd, class_name, MAX_PATH);
    output_win.class_name = std::wstring(class_name);
}

void get_dimensions(const HWND& hwnd, WindowInfo& output_win) {
    GetWindowRect(hwnd, &output_win.dimensions);
}

void get_is_minimised(const HWND& hwnd, WindowInfo& output_win) {
    output_win.is_minimised = IsIconic(hwnd);
}

void get_process_memory_usage(const HANDLE& process_handle, WindowInfo& output_win) {
    PROCESS_MEMORY_COUNTERS pmc;
    if (GetProcessMemoryInfo(process_handle, &pmc, sizeof(pmc))) {
        output_win.memory_usage = pmc.WorkingSetSize; // Memory usage in bytes
    }
}

void get_process_start_time(const HANDLE& process_handle, WindowInfo& output_win) {
    // todo: creation time does not give correct results for some reason...
    if (NULL == process_handle)
        return;

    if (GetProcessTimes(process_handle, &output_win.creation_time, &output_win.exit_time, &output_win.kernel_time, &output_win.user_time)) {
        // success
    }
}

void get_exe_name(const HANDLE& process_handle, WindowInfo& output_win) {
    WCHAR exe_name[MAX_PATH] = L"Unknown"; // Default if we can't get the name
    if (GetModuleFileNameEx(process_handle, NULL, exe_name, MAX_PATH) == 0) {
        wcscpy_s(exe_name, L"Unknown"); // Fallback if GetModuleFileNameEx fails
    }
    output_win.exe_name = exe_name;
}

void get_module_name_for_given_process(const HANDLE& process_handle, WindowInfo& output_win) {
    WCHAR module_name[MAX_PATH] = L"Unknown";
    DWORD moduleCount;
    HMODULE modules[1024];
    if (EnumProcessModules(process_handle, modules, sizeof(modules), &moduleCount)) {
        if (GetModuleBaseName(process_handle, modules[0], module_name, sizeof(module_name) / sizeof(WCHAR))) {
            // Successfully retrieved the module name
            output_win.module_name = module_name;
        }
    }

    // todo - something went wrong
}

BOOL CALLBACK EnumWindowsProc(HWND hwnd, LPARAM lParam) {
    if (!IsWindowVisible(hwnd)) return TRUE;
    WindowInfo win_info_output;

    get_dimensions(hwnd, win_info_output);
    get_is_minimised(hwnd, win_info_output);
    get_process_class_name(hwnd, win_info_output);
    DWORD title_length = get_window_title(hwnd, win_info_output);

    if (title_length > 0) { // Checking className length for windows with no title
        DWORD processId;
        GetWindowThreadProcessId(hwnd, &processId);
        HANDLE processHandle = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processId);

        get_process_start_time(processHandle, win_info_output);

        if (processHandle) {
            get_exe_name(processHandle, win_info_output);

            get_module_name_for_given_process(processHandle, win_info_output);

            get_process_memory_usage(processHandle, win_info_output);

            CloseHandle(processHandle);
        }

        std::vector<WindowInfo>* windows = reinterpret_cast<std::vector<WindowInfo>*>(lParam);
        windows->push_back(std::move(win_info_output));
    }

    return TRUE;
}


std::vector<WindowInfo> WindowsAppsInfoManager::get_windows_info() {
    std::vector<WindowInfo> windows;
    EnumWindows(EnumWindowsProc, reinterpret_cast<LPARAM>(&windows));
    return windows;
}