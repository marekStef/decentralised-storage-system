#include "automaticStartupHelpers.hpp"
#include <windows.h>
#include <string>

std::wstring GetApplicationPath() {
    wchar_t path[MAX_PATH] = { 0 };
    if (GetModuleFileName(NULL, path, MAX_PATH) > 0) {
        return std::wstring(path);
    }
    return L"";
}

bool addAppToAutomaticStartupAppsList() {
    HKEY hKey;
    LPCWSTR path = L"Software\\Microsoft\\Windows\\CurrentVersion\\Run";
    LPCWSTR valueName = L"ActivityTracker";
    std::wstring appPath = GetApplicationPath(); // Change this to the actual path of your application

    // Convert appPath to a wide string if your application uses Unicode
    std::wstring appPathW(appPath.begin(), appPath.end());

    // Open the registry key
    if (RegOpenKeyEx(HKEY_CURRENT_USER, path, 0, KEY_WRITE, &hKey) == ERROR_SUCCESS) {
        // Set the value
        if (RegSetValueEx(hKey, valueName, 0, REG_SZ, (BYTE*)appPathW.c_str(), (appPathW.size() + 1) * sizeof(wchar_t)) == ERROR_SUCCESS) {
            //MessageBox(NULL, L"Application added to startup successfully.", L"Success", MB_OK);
            return true;
        }
        else {
            //MessageBox(NULL, L"Failed to add application to startup.", L"Error", MB_OK);
            return false;
        }

        // Close the registry key
        RegCloseKey(hKey);
    }
    else {
        //MessageBox(NULL, L"Failed to open registry key.", L"Error", MB_OK);
        return false;
    }
}

bool RemoveAppFromStartup() {
    HKEY hKey;
    LPCWSTR path = L"Software\\Microsoft\\Windows\\CurrentVersion\\Run";
    LPCWSTR valueName = L"ActivityTracker";

    // Open the registry key
    if (RegOpenKeyEx(HKEY_CURRENT_USER, path, 0, KEY_WRITE, &hKey) == ERROR_SUCCESS) {
        // Delete the value
        if (RegDeleteValue(hKey, valueName) == ERROR_SUCCESS) {
            //MessageBox(NULL, L"Application removed from startup successfully.", L"Success", MB_OK);
            return true;
        }
        else {
            //MessageBox(NULL, L"Failed to remove application from startup.", L"Error", MB_OK);
            return false;
        }

        // Close the registry key
        RegCloseKey(hKey);
    }
    else {
        //MessageBox(NULL, L"Failed to open registry key.", L"Error", MB_OK);
        return false;
    }
}

bool IsAppInStartupList() {
    HKEY hKey;
    LPCWSTR path = L"Software\\Microsoft\\Windows\\CurrentVersion\\Run";
    LPCWSTR valueName = L"ActivityTracker";
    LONG lResult;
    bool isInStartup = false;

    lResult = RegOpenKeyEx(HKEY_CURRENT_USER, path, 0, KEY_READ, &hKey);
    if (lResult == ERROR_SUCCESS) {
        DWORD dwType = REG_SZ;
        wchar_t szPath[MAX_PATH] = { 0 };
        DWORD dwBufferSize = sizeof(szPath);

        lResult = RegQueryValueEx(hKey, valueName, NULL, &dwType, (LPBYTE)&szPath, &dwBufferSize);
        if (lResult == ERROR_SUCCESS) {
            isInStartup = true;
        }

        RegCloseKey(hKey);
    }

    return isInStartup;
}