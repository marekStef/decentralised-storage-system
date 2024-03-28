#ifndef _NETWORK_HELPERS_HPP_
#define _NETWORK_HELPERS_HPP_

#include <string>
#include "nlohmann/json.hpp"
#include "WindowInfo.hpp"
#include <curl/curl.h>

using json = nlohmann::json;

json serializeWindowInfoToJson(const WindowInfo& window_info);

json serializeWindowsInfoToJson(const std::vector<WindowInfo>& windows_info);

void saveCurrentWindowsInfoToFile(const std::string& filePath, const std::string& createdDateInISO);

void tryToSendUnsynchronisedEventsFilesToDataStorageServer(
	const std::string& serverAddress,
	const std::string& serverPort,
	const std::string& accessTokenForActivityTrackerEvents,
	const std::string& appsInfoDir
);

#endif // !_NETWORK_HELPERS_HPP_
