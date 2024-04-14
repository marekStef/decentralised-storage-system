#include <filesystem>
#include <curl/curl.h>
#include <nlohmann/json.hpp>
#include <iostream>
#include <string>
#include "WindowInfo.hpp"
#include "WindowsAppsInfoManager.hpp"
#include "windowsAppsInfoNetworkHelpers.hpp"
#include "constants.hpp"
#include "JsonHelpers.hpp"
#include "dataStorageSetupNetworkHelpers.hpp"

using json = nlohmann::json;

json serializeWindowInfoToJson(const WindowInfo& window_info, const std::string& createdDateInISO) {
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
		}},
		{"metadata", {
			{"createdDate", createdDateInISO},
			{"profile", activityTrackerEventProfileName}
		}}
	};
}

json serializeWindowsInfoToJson(const std::vector<WindowInfo>& windows_info, const std::string& createdDateInISO) {
	json j;
	for (const auto& window_info : windows_info) {
		j.push_back(serializeWindowInfoToJson(window_info, createdDateInISO));
	}
	return j;
}

void saveCurrentWindowsInfoToFile(const std::string& filePath, const std::string& createdDateInISO) {
	auto windows_manager = WindowsAppsInfoManager();
	auto windowsInfo = windows_manager.getWindowsInfo();

	json jsonResult = serializeWindowsInfoToJson(windowsInfo, createdDateInISO);

	saveJsonToFile(jsonResult, filePath);
}

std::string ReadFileContent(const std::string& filePath) {
	std::ifstream fileStream(filePath);
	if (!fileStream.is_open()) {
		std::cerr << "Failed to open file: " << filePath << '\n';
		return "";
	}
	return { std::istreambuf_iterator<char>(fileStream), std::istreambuf_iterator<char>() };
}

bool sendUnsynchronisedEventFileToDataStorageServer(
	const std::string& serverAddress, 
	const std::string& serverPort,
	const std::string& accessTokenForActivityTrackerEvents,
	const std::string& activityTrackerEventJsonFilePath
) {
	std::string fileContent = ReadFileContent(activityTrackerEventJsonFilePath);
	if (fileContent.empty()) {
		std::cerr << "Failed to read file or file is empty: " << activityTrackerEventJsonFilePath << '\n';
		return false;
	}

	nlohmann::json postBody = {
		{"accessToken", accessTokenForActivityTrackerEvents},
		{"profileCommonForAllEventsBeingUploaded", activityTrackerEventProfileName},
		{"events", nlohmann::json::parse(fileContent)}
	};

	std::string responseMessage;
	return PostDataToServer(serverAddress, serverPort, "/app/api/uploadNewEvents", postBody, responseMessage);
}

void tryToSendUnsynchronisedEventsFilesToDataStorageServer(
	const std::string& serverAddress,
	const std::string& serverPort,
	const std::string& accessTokenForActivityTrackerEvents, 
	const std::string& appsInfoDir
) {
	namespace fs = std::filesystem;

	fs::path targetDir = fs::path(appsInfoDir) / "syncedEvents";
	fs::create_directories(targetDir);

	for (const auto& entry : fs::directory_iterator(appsInfoDir)) {
		if (entry.is_regular_file() && entry.path().extension() == ".json") {
			std::string filePath = entry.path().string();

			if (sendUnsynchronisedEventFileToDataStorageServer(
				serverAddress,
				serverPort,
				accessTokenForActivityTrackerEvents,
				filePath
			)) {
				fs::path targetPath = targetDir / entry.path().filename();
				fs::rename(filePath, targetPath);
				//std::filesystem::remove(filePath);
			}
			else {
				std::cerr << "Failed to upload data for file: " << ". Error: " << '\n';
			}
		}
	}
}