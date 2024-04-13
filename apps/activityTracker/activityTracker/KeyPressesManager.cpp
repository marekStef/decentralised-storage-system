#include <windows.h>
#include <memory>
#include <filesystem>

#include <thread>
#include <atomic>
#include <fstream>

#include "KeyPressesManager.hpp"
//#include "ConfigManager.hpp"

constexpr char ONLY_ONE_INSTANCE_ERROR_MESSAGE[] = "Only one instance allowed";

void createFolderIfNotExists(const std::filesystem::path& path) {
    if (!std::filesystem::exists(path)) {
        // Create the folder
        if (std::filesystem::create_directory(path)) {
            std::cout << "Folder '" << path.string() << "' created successfully" << std::endl;
        }
        else {
            std::cout << "Failed to create folder: " << path << std::endl;
        }
    }
    else {
        //std::cout << "Folder already exists (not creating one): " << path << std::endl;
    }
}

std::shared_ptr<KeyPressesManager> KeyPressesManager::instance_ = nullptr;
std::atomic_bool KeyPressesManager::running_ = false;
DWORD KeyPressesManager::message_loop_thread_id_ = 0;
std::ofstream KeyPressesManager::log_file_;

std::shared_ptr<KeyPressesManager> KeyPressesManager::CreateManagerInstance() {
    if (instance_ == nullptr) {
        instance_ = std::make_shared<KeyPressesManager>();
        return instance_;
    }
    else
        throw std::runtime_error(ONLY_ONE_INSTANCE_ERROR_MESSAGE);
}

KeyPressesManager::KeyPressesManager(){};

void KeyPressesManager::Start(const std::filesystem::path& filepath) {
    if (!filepath.has_filename()) {
        std::cout << "The provided path is considered as a directory." << std::endl;
        return;
    }

    createFolderIfNotExists(filepath.parent_path());

    log_file_.open(filepath, std::ios::app | std::ios::out);

    if (!log_file_.is_open()) {
        throw std::runtime_error("Failed to open or create log file.");
    }

    running_ = true;
    std::thread(&KeyPressesManager::message_loop_thread, this).detach(); // Start the message loop in a new thread
}
void KeyPressesManager::End() {
    running_ = false;

    // this PostThreadMessage is needed here.
    // reason:
    // The GetMessage function in message_loop_thread retrieves a message from the calling thread's message queue. 
    // If there are no messages in the queue, GetMessage blocks until a message becomes available. 
    // This blocking behavior is the reason why simply setting running_ = false may not cause the thread to exit immediately or at all, 
    // especially if it's stuck waiting for a new message.
    if (message_loop_thread_id_ != 0) { // Ensure we have a valid thread ID before trying to post the message
        PostThreadMessage(message_loop_thread_id_, WM_QUIT, 0, 0); // immediately signal the thread to stop
    }

    log_file_.close();
}

void KeyPressesManager::message_loop_thread() {
    message_loop_thread_id_ = GetCurrentThreadId();
    set_global_keyboard_hook();

    MSG msg;
    while (GetMessage(&msg, NULL, 0, 0) > 0 && running_) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

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
                log_file_ << "Ctrl+" << pkbhs->vkCode << " pressed" << std::endl;
            }
            else if (shift_is_pressed) {
                log_file_ << "Shift+" << pkbhs->vkCode << " pressed" << std::endl;
            }
            else {
                // only a single key is pressed
                log_file_ << "Key Down: " << pkbhs->vkCode << std::endl;
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