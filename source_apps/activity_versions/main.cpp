#include <windows.h>
#include <psapi.h> // For GetModuleFileNameEx
#include <iostream>
#include <vector>
#include <set>

struct WindowInfo {
    DWORD processId;
    std::wstring title;
    std::wstring exeName;
};

BOOL CALLBACK EnumWindowsProc(HWND hwnd, LPARAM lParam) {
    const DWORD TITLE_SIZE = 1024;
    WCHAR windowTitle[TITLE_SIZE];

    if (!IsWindowVisible(hwnd)) return TRUE;

    DWORD titleLength = GetWindowTextW(hwnd, windowTitle, TITLE_SIZE);

    if (titleLength > 0) {
        DWORD processId;
        GetWindowThreadProcessId(hwnd, &processId);

        HANDLE processHandle = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processId);
        WCHAR exeName[MAX_PATH];
        if (processHandle) {
            GetModuleFileNameEx(processHandle, NULL, exeName, MAX_PATH);
            CloseHandle(processHandle);
        }
        else {
            wcscpy_s(exeName, L"Unknown");
        }

        WindowInfo windowInfo = { processId, std::wstring(windowTitle), std::wstring(exeName) };
        std::vector<WindowInfo>* windows = reinterpret_cast<std::vector<WindowInfo>*>(lParam);
        windows->push_back(windowInfo);
    }

    return TRUE;
}

int main() {
    std::vector<WindowInfo> windows;

    // Enumerate through all top-level windows
    EnumWindows(EnumWindowsProc, reinterpret_cast<LPARAM>(&windows));

    // Print out the title of each window
    for (const auto& window : windows) {
        std::wcout << L"PID: " << window.processId << std::endl;
        std::wcout << "Title: " << window.title << std::endl;
        std::wcout << "Executable Name: " << window.exeName << std::endl;
    }

    return 0;
}
