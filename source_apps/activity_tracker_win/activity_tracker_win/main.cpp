#include <windows.h>
#include <psapi.h> // For GetModuleFileNameEx
#include <iostream>
#include <vector>
#include <set>

#include <ostream>

#include "windows_apps_info_manager.hpp"


int main() {

    auto windows_manager = WindowsAppsInfoManager();

    for (const auto& window : windows_manager.get_windows_info()) {
        std::wcout << window << std::endl;
    }

    return 0;
}
