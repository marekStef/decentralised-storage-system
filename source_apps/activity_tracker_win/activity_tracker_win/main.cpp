#include <ostream>

#include "windows_apps_info_manager.hpp"
#include "screenshots_manager.hpp"

void get_windows_apps_info() {
    auto windows_manager = WindowsAppsInfoManager();
    for (const auto& window : windows_manager.get_windows_info()) {
        std::wcout << window << std::endl;
    }
}

int main() {
    //get_windows_apps_info();

    ScreenshotsManager screenshots_manager("./");
    screenshots_manager.take_screenshots_of_all_screens();
    
    return 0;
}
