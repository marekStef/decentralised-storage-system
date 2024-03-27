#ifndef _CONSTANTS_HPP
#define _CONSTANTS_HPP

#include <string>

const std::string activityTrackerAppUniqueName = "activityTracker.com";
const std::string dataStorageCoreProfile = "core:profile-registration_v1";
const std::string activityTrackerEventProfileName = activityTrackerAppUniqueName + "/activityTrackerEvent";

constexpr int PERIODIC_FUNCTION_INTERVAL_IN_MILLISECONDS = 300000; // 5 minutes

#endif // !_CONSTANTS_HPP

