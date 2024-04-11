#ifndef _DATA_STORAGE_SETUP_HELPERS_HPP_
#define _DATA_STORAGE_SETUP_HELPERS_HPP_

#include <string>
#include "nlohmann/json.hpp"
#include "WindowInfo.hpp"
#include <curl/curl.h>

bool CheckAuthServicePresenceCurl(const std::string& serverAddress, const std::string& serverPort);

std::string AssociateWithStorageAppHolder(const std::string& serverAddress, const std::string& serverPort, const std::string& associationTokenId);

bool RegisterNewProfile(
	const std::string& serverAddress, 
	const std::string& serverPort, 
	const std::string& jwtTokenForPermissionRequestsAndProfiles, 
	const nlohmann::json& jsonSchema,
	std::string& responseMessage
);

bool RequestNewPermission(
	const std::string& serverAddress,
	const std::string& serverPort,
	const std::string& jwtTokenForPermissionRequestsAndProfiles,
	std::string& responseMessage,
	std::string& generatedAccessToken
);

bool PostDataToServer(
	const std::string& serverAddress,
	const std::string& serverPort,
	const std::string& apiEndpoint,
	const nlohmann::json& postData,
	std::string& responseMessage
);

#endif // !_DATA_STORAGE_SETUP_HELPERS_HPP_
