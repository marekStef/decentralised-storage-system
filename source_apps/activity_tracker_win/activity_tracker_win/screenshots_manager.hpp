#ifndef _SCREENSHOTS_MANAGER_HPP_
#define _SCREENSHOTS_MANAGER_HPP_

#include <string>
#include <vector>
#pragma comment(lib, "gdiplus.lib")
#include <gdiplus.h>

inline ULONG IMAGE_QUALITY_LEVEL = 90; // Quality level between 0 and 100
constexpr wchar_t DESIRED_IMAGE_TYPE[] = L"jpeg";
constexpr wchar_t DESIRED_OUTPUT_IMAGE_MIME_TYPE[] = L"image/jpeg";

struct MonitorInfo {
	HMONITOR hMonitor;
	RECT rect;
};

class ScreenshotsManager {
public:
	ScreenshotsManager(const wchar_t* output_directory);
	std::vector<std::wstring> take_screenshots_of_all_screens();
private:
	wchar_t* output_dir_;

	Gdiplus::EncoderParameters encoder_params;

	void capture_monitor(const MonitorInfo& monitorInfo, wchar_t* output_filename) const;
	std::vector<MonitorInfo> get_all_monitors();
};

#endif // !_SCREENSHOTS_MANAGER_HPP_
