#include <windows.h>
#include <wlanapi.h>
#include <objbase.h>
#include <wtypes.h>
#include <iostream>
#include <string>
#include <vector>

#include "NetworkManager.hpp"

constexpr char FILE_HANDLE_NOT_OPENED_MESSAGE[] = "Failed to open WLAN handle.";
constexpr char FAILED_ENUMERATE_WLAN_INTERFACES[] = "Failed to enumerate WLAN interfaces.";
constexpr char FAILED_TO_GET_AVAILABLE_NETWORK_LIST[] = "Failed to get available network list.";

//#define DEBUG

/// <summary>
/// Initialize a WLAN client handle and negotiate a version.
/// </summary>
/// <param name="wlan_client_handle">A reference to a HANDLE for the WLAN client.</param>
void initialiseWlanHandle(HANDLE& wlan_client_handle) {
    DWORD client_version = 2;  // Desired version of the WLAN API.
    DWORD negotiated_version = 0;
    DWORD operation_result = WlanOpenHandle(client_version, NULL, &negotiated_version, &wlan_client_handle);

    if (operation_result != ERROR_SUCCESS)
        throw std::runtime_error(FILE_HANDLE_NOT_OPENED_MESSAGE);
}

/// <summary>
/// Enumerate WLAN interfaces.
/// </summary>
/// <param name="wlan_client_handle">The WLAN client handle.</param>
/// <param name="interfaces_info_list">A reference to a pointer for WLAN_INTERFACE_INFO_LIST.</param>
/// <returns></returns>
void enumerateWlanInterfaces(HANDLE wlan_client_handle, PWLAN_INTERFACE_INFO_LIST& interfaces_info_list) {
    DWORD result = WlanEnumInterfaces(wlan_client_handle, NULL, &interfaces_info_list);

    if (result != ERROR_SUCCESS) {
        WlanCloseHandle(wlan_client_handle, NULL);
        throw std::runtime_error(FAILED_ENUMERATE_WLAN_INTERFACES);
    }
}

/// <summary>
/// Retrieve and print the SSID of the connected network for a given interface.
/// </summary>
/// <param name="wlan_client_handle">The WLAN client handle.</param>
/// <param name="interface_info">interface_info contains GUID of the interface needed to get the ssids</param>
std::string retrieveSSIDForGivenInterface(HANDLE wlan_client_handle, const WLAN_INTERFACE_INFO& interface_info) {
    // Get the list of available networks for the current interface
    PWLAN_AVAILABLE_NETWORK_LIST available_network_list = NULL;
    DWORD result = WlanGetAvailableNetworkList(wlan_client_handle, &interface_info.InterfaceGuid, 0, NULL, &available_network_list);

    if (result == ERROR_SUCCESS) { // operation completed successfully (strange constant name)
        for (int j = 0; j < (int)available_network_list->dwNumberOfItems; j++) {
            PWLAN_AVAILABLE_NETWORK network_entry = &available_network_list->Network[j];

            std::string current_ssid = std::string((char*)network_entry->dot11Ssid.ucSSID, network_entry->dot11Ssid.uSSIDLength);

#ifdef DEBUG
            std::cout << "current ssid: " << current_ssid << std::endl;

            // printing interface name as well
            char interfaceName[256] = { 0 };
            WideCharToMultiByte(CP_UTF8, 0, interface_info.strInterfaceDescription, -1, interfaceName, sizeof(interfaceName), NULL, NULL);
            std::cout << interfaceName << std::endl;
#endif
            // Check if this network is currently connected
            if (network_entry->dwFlags & WLAN_AVAILABLE_NETWORK_CONNECTED) {
                return current_ssid; // SSID found, no need to check other networks
            }
        }
        WlanFreeMemory(available_network_list); // Free the network list
    }
    else {
        throw std::runtime_error(FAILED_TO_GET_AVAILABLE_NETWORK_LIST);
    }

    return "";
#ifdef DEBUG
    std::cout << "------" << std::endl;
#endif
}

std::vector<std::string> getCurrentSSIDsInternal() {
    HANDLE wlan_client_handle = NULL;
    initialiseWlanHandle(wlan_client_handle);

    // Enumerate all WLAN interfaces
    PWLAN_INTERFACE_INFO_LIST interfaces_info_list = NULL;
    enumerateWlanInterfaces(wlan_client_handle, interfaces_info_list);

    std::vector<std::string> current_SSIDs;

    for (int i = 0; i < (int)interfaces_info_list->dwNumberOfItems; ++i) {
        std::string current_ssid = retrieveSSIDForGivenInterface(wlan_client_handle, interfaces_info_list->InterfaceInfo[i]);
        current_SSIDs.push_back(current_ssid);
    }

    if (interfaces_info_list != NULL)
        WlanFreeMemory(interfaces_info_list);
    WlanCloseHandle(wlan_client_handle, NULL);

    return current_SSIDs;
}

std::vector<std::string> NetworkManager::getCurrentSSIDs() {
    try {
        return getCurrentSSIDsInternal();
    }
    catch (const std::exception& ex) {
        std::cerr << "Something went terribly wrong" << std::endl;
        std::cerr << ex.what();
        return {};
    }
}
