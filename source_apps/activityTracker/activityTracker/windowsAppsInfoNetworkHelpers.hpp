#ifndef _NETWORK_HELPERS_HPP_
#define _NETWORK_HELPERS_HPP_

#include "nlohmann/json.hpp"
#include "WindowInfo.hpp"
#include <curl/curl.h>

using json = nlohmann::json;

json serializeWindowInfoToJson(const WindowInfo& window_info);

json serializeWindowsInfoToJson(const std::vector<WindowInfo>& windows_info);

void sendJsonToServer(const std::string& json_data, const std::string& url);

bool CheckAuthServicePresenceCurl(const std::string& serverAddress, const std::string& serverPort);

#endif // !_NETWORK_HELPERS_HPP_
