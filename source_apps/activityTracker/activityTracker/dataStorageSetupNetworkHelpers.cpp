#include "dataStorageSetupNetworkHelpers.hpp"
#include "constants.hpp"

#include <iostream>
#include <string>
#include "nlohmann/json.hpp"
#include "WindowInfo.hpp"
#include <curl/curl.h>

const int HTTP_RESPONSE_CODE_OK = 200;

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

std::string AssociateWithStorageAppHolder(const std::string& serverAddress, const std::string& serverPort, const std::string& associationTokenId) {
    CURL* curl;
    CURLcode res;
    std::string readBuffer;

    std::string url = "http://" + serverAddress + ":" + serverPort + "/app/api/associateWithStorageAppHolder";
    std::string jwtToken;

    nlohmann::json jsonPayload = {
        {"associationTokenId", associationTokenId},
        {"nameDefinedByApp", activityTrackerAppUniqueName}
    };
    std::string postData = jsonPayload.dump();

    curl = curl_easy_init();
    if (curl) {
        struct curl_slist* headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");

        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, postData.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, CurlWrite_Callback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);

        res = curl_easy_perform(curl);
        long httpResponseCode = 0;
        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &httpResponseCode);

        curl_easy_cleanup(curl);
        curl_slist_free_all(headers);

        if (res != CURLE_OK) { // if the request wasnt successful
            std::cerr << "curl_easy_perform() failed: " << curl_easy_strerror(res) << '\n';
            return "";
        }
        else if (httpResponseCode != HTTP_RESPONSE_CODE_OK) {
            std::cerr << "Server responded with HTTP Status: " << httpResponseCode << '\n';
            return "";
        }

        // extract the JWT token
        try {
            auto jsonResponse = nlohmann::json::parse(readBuffer);
            jwtToken = jsonResponse["jwtTokenForPermissionRequestsAndProfiles"];
        }
        catch (nlohmann::json::parse_error& e) {
            std::cerr << "JSON parse error: " << e.what() << '\n';
            return "";
        }
    }
    return jwtToken;
}
