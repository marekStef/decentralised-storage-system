#include <ostream>

#include "windows_apps_info_manager.hpp"
#include "screenshots_manager.hpp"
#include "network_manager.hpp"

void get_windows_apps_info() {
    auto windows_manager = WindowsAppsInfoManager();
    for (const auto& window : windows_manager.get_windows_info()) {
        std::wcout << window << std::endl;
    }
}

int main() {
    //get_windows_apps_info();
    
    ScreenshotsManager screenshots_manager(L"./");
    auto screenshots_filepaths = screenshots_manager.take_screenshots_of_all_screens();

    NetworkManager network_manager;
    std::vector<std::string> SSIDs = network_manager.get_current_SSIDs();

    std::cout << "prining ssids: " << std::endl;
    for (auto&& curr_ssid : SSIDs) {
        std::cout << "- " << curr_ssid << std::endl;
    }
    
    return 0;
}
