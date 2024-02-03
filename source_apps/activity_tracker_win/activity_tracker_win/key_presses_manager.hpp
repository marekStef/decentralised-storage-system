#ifndef _KEY_PRESSES_MANAGER_HPP_
#define _KEY_PRESSES_MANAGER_HPP_

#include <ostream>
#include <windows.h>
#include <iostream>
#include <memory>
#include <atomic>

/// <summary>
/// Able to be used only as a singleton
/// </summary>
class KeyPressesManager {
public:
	static std::shared_ptr<KeyPressesManager> create_manager_instance(std::ostream& os);
	KeyPressesManager(std::ostream& os);
	void start();
	void end();
private:
	std::ostream& output_stream_;
	static std::shared_ptr<KeyPressesManager> instance_;
	static std::atomic_bool running_;
	static DWORD message_loop_thread_id_;


	void unset_global_keyboard_hook();
	void set_global_keyboard_hook();
	static LRESULT CALLBACK low_level_keyboard_press_callback(int nCode, WPARAM wParam, LPARAM lParam);

	void message_loop_thread();
};

#endif // !_KEY_PRESSES_MANAGER_HPP_
