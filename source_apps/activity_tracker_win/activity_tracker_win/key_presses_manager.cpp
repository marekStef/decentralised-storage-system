#include <windows.h>
#include <iostream>
#include <memory>

#include "key_presses_manager.hpp"
#include "key_presses_manager_constants.hpp"

std::shared_ptr<KeyPressesManager> KeyPressesManager::instance_ = nullptr;
std::shared_ptr<KeyPressesManager> KeyPressesManager::create_manager_instance(std::ostream& os) {
    if (instance_ == nullptr) {
        instance_ = std::make_shared<KeyPressesManager>(os);
        return instance_;
    }
    else
        throw std::runtime_error(ONLY_ONE_INSTANCE_ERROR_MESSAGE);
}
KeyPressesManager::KeyPressesManager(std::ostream& os) : output_stream_(os) {};
void KeyPressesManager::start() {
    set_global_keyboard_hook();
}
void KeyPressesManager::end() {
    unset_global_keyboard_hook();
}

// Global Hook Handle
// holds the handle to the installed keyboard hook. 
// This handle is used to manage the hook, specifically for setting it up and removing it when no longer needed.
HHOOK global_handle_keyboard_hook;

/// <summary>
/// This function is the callback that gets called by the Windows system whenever a keyboard event occurs that matches the criteria of the hook (in this case, low-level keyboard events).
/// </summary>
/// <param name="nCode">
/// A code that indicates whether to process the message. If nCode is HC_ACTION, it means the callback should process the message.
/// </param>
/// <param name="wParam">wParam indicates the type of keyboard event (e.g., WM_KEYDOWN, WM_KEYUP)</param>
/// <param name="lParam">lParam points to a KBDLLHOOKSTRUCT structure containing details about the key event</param>
/// <returns></returns>
LRESULT CALLBACK KeyPressesManager::low_level_keyboard_press_callback(int nCode, WPARAM wParam, LPARAM lParam) {
    if (nCode == HC_ACTION) {
        KBDLLHOOKSTRUCT* pkbhs = (KBDLLHOOKSTRUCT*)lParam;
        if (wParam == WM_KEYDOWN) {
            bool ctrl_is_pressed = GetAsyncKeyState(VK_CONTROL) & 0x8000;
            bool shift_is_pressed = GetAsyncKeyState(VK_SHIFT) & 0x8000;
            
            // first checking whether a combination of ctr/shift + some other key is pressed
            if (ctrl_is_pressed) {
                instance_->output_stream_ << "Ctrl+" << pkbhs->vkCode << " pressed" << std::endl;
            }
            else if (shift_is_pressed) {
                instance_->output_stream_ << "Shift+" << pkbhs->vkCode << " pressed" << std::endl;
            }
            else {
                // only a single key is pressed
                instance_->output_stream_ << "Key Down: " << pkbhs->vkCode << std::endl;
            }
        }
    }
    return CallNextHookEx(global_handle_keyboard_hook, nCode, wParam, lParam);
}

/// <summary>
/// Manages the lifecycle of the keyboard hook.
/// Installs the hook using SetWindowsHookEx, specifying WH_KEYBOARD_LL for a low-level keyboard hook 
/// and passing LowLevelKeyboardProc as the callback function.
/// </summary>
void KeyPressesManager::set_global_keyboard_hook() {
    global_handle_keyboard_hook = SetWindowsHookEx(WH_KEYBOARD_LL, low_level_keyboard_press_callback, nullptr, 0);
    if (global_handle_keyboard_hook == NULL) {
        std::cerr << "Failed to install keyboard hook!" << std::endl;
    }
}

/// <summary>
/// Manages the lifecycle of the keyboard hook.
/// Removes the hook with UnhookWindowsHookEx, ensuring the hook is deactivated when no longer needed.
/// </summary>
void KeyPressesManager::unset_global_keyboard_hook() {
    if (global_handle_keyboard_hook != NULL) {
        UnhookWindowsHookEx(global_handle_keyboard_hook);
        global_handle_keyboard_hook = NULL;
    }
}