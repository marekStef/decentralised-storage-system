#ifndef _SCREENSHOTS_MANAGER_HPP_
#define _SCREENSHOTS_MANAGER_HPP_

#include <string>
#include <filesystem>
#include <vector>
#include "curl/curl.h"
#include <windows.h>
#pragma comment(lib, "gdiplus.lib")
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
	std::vector<std::filesystem::path> take_screenshots_of_all_screens(const std::filesystem::path& output_directory) const;
	bool upload_screenshots_to_server(const std::vector<std::filesystem::path>& file_paths) const;
private:
	std::filesystem::path output_dir_;

	Gdiplus::EncoderParameters encoder_params;

	void capture_monitor(const MonitorInfo& monitorInfo, const std::filesystem::path& output_filename) const;
	std::vector<MonitorInfo> get_all_monitors() const;
};

#endif // !_SCREENSHOTS_MANAGER_HPP_
