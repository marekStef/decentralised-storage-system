#include <curl/curl.h>
#include <nlohmann/json.hpp>
#include <iostream>
#include <string>
#include "WindowInfo.hpp"

#include "windowsAppsInfoNetworkHelpers.hpp"

using json = nlohmann::json;

json serializeWindowInfoToJson(const WindowInfo& window_info) {
	// Converting wide strings to regular strings
	// This utility function is for conversion std::wstring to std::string
	auto wstring_to_string = [](const std::wstring& wstr) -> std::string {
		if (wstr.empty()) return {};
		int size_needed = WideCharToMultiByte(CP_UTF8, 0, &wstr[0], (int)wstr.size(), NULL, 0, NULL, NULL);
		std::string strTo(size_needed, 0);
		WideCharToMultiByte(CP_UTF8, 0, &wstr[0], (int)wstr.size(), &strTo[0], size_needed, NULL, NULL);
		return strTo;
		};

	// Serialization
	return {
		{"payload", {
			{"processId", std::to_string(window_info.processId)},
			{"title", wstring_to_string(window_info.title)},
			{"exeName", wstring_to_string(window_info.exe_name)},
			{"memoryUsageInBytes", std::to_string(window_info.memory_usage)},
			{"isMinimised", window_info.is_minimised },
			{"moduleName", wstring_to_string(window_info.module_name) },
			{"dimensions", {
				{ "top", window_info.dimensions.top },
				{ "left", window_info.dimensions.left },
				{ "right", window_info.dimensions.right },
				{ "bottom", window_info.dimensions.bottom },
			}}
		}}
	};
}

json serializeWindowsInfoToJson(const std::vector<WindowInfo>& windows_info) {
	json j;
	for (const auto& window_info : windows_info) {
		j.push_back(serializeWindowInfoToJson(window_info));
	}
	return j;
}

// todo: this is not used at the moment
void sendJsonToServer(const std::string& json_data, const std::string& url) {
	CURL* curl = curl_easy_init();
	if (curl) {
		curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
		curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_data.c_str());

		struct curl_slist* headers = NULL;
		headers = curl_slist_append(headers, "Content-Type: application/json");
		curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

		// Performing POST request
		CURLcode res = curl_easy_perform(curl);

		// cleanup
		curl_slist_free_all(headers);
		curl_easy_cleanup(curl);
	}
}


size_t CurlWrite_Callback(void* contents, size_t size, size_t nmemb, std::string* userp) {
    userp->append((char*)contents, size * nmemb);
    return size * nmemb;
}

bool CheckAuthServicePresenceCurl(const std::string& serverAddress, const std::string& serverPort) {
    CURL* curl;
    CURLcode res;
    std::string readBuffer;
    std::string url = "http://" + serverAddress + ":" + serverPort + "/status_info/checks/check_auth_service_presence";

    curl = curl_easy_init();
    if (curl) {
        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, CurlWrite_Callback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
        res = curl_easy_perform(curl);
        curl_easy_cleanup(curl);

        if (res != CURLE_OK) {
            std::cerr << "curl_easy_perform() failed: " << curl_easy_strerror(res) << '\n';
            return false;
        }

        try {
            auto json = nlohmann::json::parse(readBuffer);
            if (json["status"] == "OK") {
                return true;
            }
            else {
                std::cerr << "Error: Status not OK" << '\n';
                return false;
            }
        }
        catch (nlohmann::json::parse_error& e) {
            std::cerr << "JSON parse error: " << e.what() << '\n';
            return false;
        }
    }
    return false;
}
