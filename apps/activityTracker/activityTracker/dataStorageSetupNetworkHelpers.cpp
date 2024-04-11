#include "dataStorageSetupNetworkHelpers.hpp"
#include "constants.hpp"

#include <iostream>
#include <string>
#include "nlohmann/json.hpp"
#include "WindowInfo.hpp"
#include <curl/curl.h>

#include <chrono>
#include <sstream>
#include <ctime>

#include "timeHelpers.hpp"


const int HTTP_RESPONSE_CODE_OK = 200;
const int HTTP_RESPONSE_CODE_CREATED = 201;
const int HTTP_RESPONSE_CODE_FORBIDDEN = 403;

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

bool RegisterNewProfile(
    const std::string& serverAddress, 
    const std::string& serverPort, 
    const std::string& jwtTokenForPermissionRequestsAndProfiles, 
    const nlohmann::json& jsonSchema, 
    std::string& responseMessage
) {
    CURL* curl;
    CURLcode res;
    std::string readBuffer;
    std::string url = "http://" + serverAddress + ":" + serverPort + "/app/api/registerNewProfile";

    nlohmann::json requestBody = {
        {"jwtTokenForPermissionRequestsAndProfiles", jwtTokenForPermissionRequestsAndProfiles},
        {"metadata", {
            {"createdDate", GetCurrentISODate()},
            {"profile", dataStorageCoreProfile}
        }},
        {"payload", {
            {"profile_name", activityTrackerEventProfileName},
            {"json_schema", jsonSchema}
        }}
    };

    std::string postData = requestBody.dump();

    curl = curl_easy_init();
    if (curl) {
        struct curl_slist* headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        headers = curl_slist_append(headers, ("Authorization: Bearer " + jwtTokenForPermissionRequestsAndProfiles).c_str());

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

        if (res != CURLE_OK) {
            std::cerr << "curl_easy_perform() failed: " << curl_easy_strerror(res) << '\n';
            responseMessage = "Something went wrong";
            return false;
        }

        if (httpResponseCode == HTTP_RESPONSE_CODE_CREATED) {
            std::cout << "Profile registered successfully." << '\n';
            responseMessage = "Profile registered successfully";
            return true;
        }
        else {
            std::cerr << "Server responded with HTTP Status: " << httpResponseCode << '\n';
            try {
                auto jsonResponse = nlohmann::json::parse(readBuffer);
                if (jsonResponse.contains("message")) {
                    std::cerr << "Error message: " << jsonResponse["message"].get<std::string>() << '\n';
                    responseMessage = jsonResponse["message"];
                    return false;
                }
            }
            catch (nlohmann::json::parse_error& e) {
                std::cerr << "JSON parse error: " << e.what() << '\n';
            }
        }
    }
    responseMessage = "Something went wrong";
    return false;
}

bool RequestNewPermission(
    const std::string& serverAddress,
    const std::string& serverPort,
    const std::string& jwtTokenForPermissionRequestsAndProfiles,
    std::string& responseMessage,
    std::string& generatedAccessToken
) {
    CURL* curl;
    CURLcode res;
    std::string readBuffer;
    std::string url = "http://" + serverAddress + ":" + serverPort + "/app/api/requestNewPermission";

    // Prepare the JSON payload
    nlohmann::json requestBody = {
        {"jwtTokenForPermissionRequestsAndProfiles", jwtTokenForPermissionRequestsAndProfiles},
        {"permissionsRequest", {
            {"profile", activityTrackerEventProfileName},
            {"read", false},
            {"create", true},
            {"modify", false},
            {"delete", false}
        }},
        {"optionalMessage", "Activity Tracker needs to save gathered Windows apps data in the storage"}
    };

    std::string postData = requestBody.dump();

    curl = curl_easy_init();
    if (curl) {
        struct curl_slist* headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        headers = curl_slist_append(headers, ("Authorization: Bearer " + jwtTokenForPermissionRequestsAndProfiles).c_str());

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

        if (res != CURLE_OK) {
            std::cerr << "curl_easy_perform() failed: " << curl_easy_strerror(res) << '\n';
            responseMessage = "Something went wrong with the request.";
            return false;
        }

        if (httpResponseCode == HTTP_RESPONSE_CODE_CREATED) {
            try {
                auto jsonResponse = nlohmann::json::parse(readBuffer);
                if (jsonResponse.contains("message") && jsonResponse.contains("generatedAccessToken")) {
                    responseMessage = jsonResponse["message"];
                    generatedAccessToken = jsonResponse["generatedAccessToken"];
                    return true;
                }
                else {
                    std::cerr << "Response does not contain expected fields." << '\n';
                    responseMessage = "Invalid response format.";
                    return false;
                }
            }
            catch (nlohmann::json::parse_error& e) {
                std::cerr << "JSON parse error: " << e.what() << '\n';
                responseMessage = "Error parsing response JSON.";
                return false;
            }
            catch (...) {
                responseMessage = "sometalsdkfj";
                return false;
            }
        }
        else {
            /*try {
                auto jsonResponse = nlohmann::json::parse(readBuffer);
                if (jsonResponse.contains("message")) {
                    std::cerr << "Error message: " << jsonResponse["message"].get<std::string>() << '\n';
                    responseMessage = jsonResponse["message"];
                    return false;
                }
            }
            catch (nlohmann::json::parse_error& e) {
                std::cerr << "JSON parse error: " << e.what() << '\n';
                responseMessage = "Server error.";
            }*/
            return false;
        }
    }
    responseMessage = "Failed to initialize CURL.";
    return false;
}

bool PostDataToServer(
    const std::string& serverAddress,
    const std::string& serverPort,
    const std::string& apiEndpoint,
    const nlohmann::json& postData,
    std::string& responseMessage
) {
    CURL* curl;
    CURLcode res;
    std::string readBuffer;
    std::string url = "http://" + serverAddress + ":" + serverPort + apiEndpoint;

    std::string postDataStr = postData.dump();

    curl = curl_easy_init();
    if (curl) {
        struct curl_slist* headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");

        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, postDataStr.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, CurlWrite_Callback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);

        res = curl_easy_perform(curl);
        long httpResponseCode = 0;
        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &httpResponseCode);

        curl_easy_cleanup(curl);
        curl_slist_free_all(headers);

        if (res != CURLE_OK) {
            std::cerr << "curl_easy_perform() failed: " << curl_easy_strerror(res) << '\n';
            responseMessage = "CURL Error: " + std::string(curl_easy_strerror(res));
            return false;
        }
        else if (httpResponseCode == HTTP_RESPONSE_CODE_FORBIDDEN) {
            responseMessage = "Access Token Is Not Active";
            return false;
        }
        else if (httpResponseCode == HTTP_RESPONSE_CODE_CREATED) {
            responseMessage = "Success";
            return true;
        }


        std::cerr << "HTTP Error: Server responded with status code " << httpResponseCode << '\n';
        responseMessage = "HTTP Error: Status " + std::to_string(httpResponseCode);
        return false;
        //try {
        //    //auto jsonResponse = nlohmann::json::parse(readBuffer);
        //    return true;
        //}
        //catch (nlohmann::json::exception& e) {
        //    std::cerr << "JSON parse error: " << e.what() << '\n';
        //    responseMessage = "JSON parse error: " + std::string(e.what());
        //    return false;
        //}
    }
    responseMessage = "Failed to initialize CURL.";
    return false;
}
