#ifndef _SCREENSHOTS_MANAGER_HPP_
#define _SCREENSHOTS_MANAGER_HPP_

#include <string>
#include <vector>
struct MonitorInfo {
	HMONITOR hMonitor;
	RECT rect;
};

class ScreenshotsManager {
public:
	ScreenshotsManager(const std::string& output_directory);
	void take_screenshots_of_all_screens();
private:
	std::string output_dir_;

	void capture_monitor(const MonitorInfo& monitorInfo, int monitorIndex) const;
	std::vector<MonitorInfo> get_all_monitors();
};

#endif // !_SCREENSHOTS_MANAGER_HPP_
