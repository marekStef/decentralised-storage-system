#include <windows.h>
#include <psapi.h> // For GetModuleFileNameEx
#include <iostream>
#include <vector>
#include <set>

struct WindowInfo {
    DWORD processId;
    std::wstring title;
    std::wstring exeName;
    std::wstring className;
    RECT dimensions;
    bool isMinimized;
};

BOOL CALLBACK EnumWindowsProc(HWND hwnd, LPARAM lParam) {
    if (!IsWindowVisible(hwnd)) return TRUE;

    const DWORD BUFFER_SIZE = 1024;
    WCHAR windowTitle[BUFFER_SIZE];
    WCHAR className[BUFFER_SIZE];
    RECT dimensions;
    bool isMinimized = IsIconic(hwnd);

    DWORD titleLength = GetWindowTextW(hwnd, windowTitle, BUFFER_SIZE);
    GetClassNameW(hwnd, className, BUFFER_SIZE);
    GetWindowRect(hwnd, &dimensions);

    if (titleLength > 0) { // Checking className length for windows with no title
        DWORD processId;
        GetWindowThreadProcessId(hwnd, &processId);

        WCHAR exeName[MAX_PATH] = L"Unknown"; // Default if we can't get the name
        HANDLE processHandle = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processId);
        if (processHandle) {
            if (GetModuleFileNameEx(processHandle, NULL, exeName, MAX_PATH) == 0) {
                wcscpy_s(exeName, L"Unknown"); // Fallback if GetModuleFileNameEx fails
            }
            CloseHandle(processHandle);
        }

        WindowInfo windowInfo = { processId, std::wstring(windowTitle), std::wstring(exeName), std::wstring(className), dimensions, isMinimized };
        std::vector<WindowInfo>* windows = reinterpret_cast<std::vector<WindowInfo>*>(lParam);
        windows->push_back(windowInfo);
    }

    return TRUE; // Continue enumeration
}

int main() {
    std::vector<WindowInfo> windows;

    // Enumerate through all top-level windows
    EnumWindows(EnumWindowsProc, reinterpret_cast<LPARAM>(&windows));

    // Print out information about each window
    for (const auto& window : windows) {
        std::wcout << L"PID: " << window.processId << std::endl;
        std::wcout << L"Title: " << window.title << std::endl;
        std::wcout << L"Executable Name: " << window.exeName << std::endl;
        std::wcout << L"Class Name: " << window.className << std::endl;
        std::wcout << L"Dimensions: " << L"Top: " << window.dimensions.top << L", Left: " << window.dimensions.left << L", Bottom: " << window.dimensions.bottom << L", Right: " << window.dimensions.right << std::endl;
        std::wcout << L"State: " << (window.isMinimized ? L"Minimized" : L"Normal/Maximized") << std::endl;
        std::wcout << std::endl; // Adding a blank line for readability between windows
    }

    return 0;
}
