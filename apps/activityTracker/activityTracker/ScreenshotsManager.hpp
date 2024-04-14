#ifndef _SCREENSHOTS_MANAGER_HPP_
#define _SCREENSHOTS_MANAGER_HPP_

#include <string>
#include <filesystem>
#include <vector>
#include "curl/curl.h"
#include <windows.h>
#include <gdiplus.h>

inline ULONG IMAGE_QUALITY_LEVEL = 90; // Quality level between 0 and 100
constexpr wchar_t DESIRED_IMAGE_TYPE[] = L"jpeg";
constexpr wchar_t DESIRED_OUTPUT_IMAGE_MIME_TYPE[] = L"image/jpeg";
const std::string DESIRED_IMAGE_TYPE_STR = "jpeg";

struct MonitorInfo {
	HMONITOR hMonitor;
	RECT rect;
};

class ScreenshotsManager {
public:
	ScreenshotsManager();
	std::vector<std::filesystem::path> takeScreenshotsOfAllScreens(const std::filesystem::path& output_directory) const;
	bool uploadScreenshotsToServer(const std::vector<std::filesystem::path>& file_paths) const;
private:
	std::filesystem::path outputDir_;

	Gdiplus::EncoderParameters encoderParams;

	void captureMonitor(const MonitorInfo& monitorInfo, const std::filesystem::path& output_filename) const;
	std::vector<MonitorInfo> getAllMonitors() const;
};

#endif // !_SCREENSHOTS_MANAGER_HPP_
