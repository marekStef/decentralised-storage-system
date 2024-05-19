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
        if (std::filesystem::create_directories(path)) {
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
DWORD KeyPressesManager::messageLoopThreadId_ = 0;
std::ofstream KeyPressesManager::logFile_;

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

    logFile_.open(filepath, std::ios::app | std::ios::out);

    if (!logFile_.is_open()) {
        throw std::runtime_error("Failed to open or create log file.");
    }

    running_ = true;
    std::thread(&KeyPressesManager::messageLoopThread, this).detach(); // Start the message loop in a new thread
}
void KeyPressesManager::End() {
    running_ = false;

    // this PostThreadMessage is needed here.
    // reason:
    // The GetMessage function in messageLoopThread retrieves a message from the calling thread's message queue. 
    // If there are no messages in the queue, GetMessage blocks until a message becomes available. 
    // This blocking behavior is the reason why simply setting running_ = false may not cause the thread to exit immediately or at all, 
    // especially if it's stuck waiting for a new message.
    if (messageLoopThreadId_ != 0) { // Ensure we have a valid thread ID before trying to post the message
        PostThreadMessage(messageLoopThreadId_, WM_QUIT, 0, 0); // immediately signal the thread to stop
    }

    logFile_.close();
}

void KeyPressesManager::messageLoopThread() {
    messageLoopThreadId_ = GetCurrentThreadId();
    setGlobalKeyboardHook();

    MSG msg;
    while (GetMessage(&msg, NULL, 0, 0) > 0 && running_) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    unsetGlobalKeyboardHook();
}

// Global Hook Handle
// holds the handle to the installed keyboard hook. 
// This handle is used to manage the hook, specifically for setting it up and removing it when no longer needed.
HHOOK globalHandleKeyboardHook;

/// <summary>
/// This function is the callback that gets called by the Windows system whenever a keyboard event occurs that matches the criteria of the hook (in this case, low-level keyboard events).
/// </summary>
/// <param name="nCode">
/// A code that indicates whether to process the message. If nCode is HC_ACTION, it means the callback should process the message.
/// </param>
/// <param name="wParam">wParam indicates the type of keyboard event (e.g., WM_KEYDOWN, WM_KEYUP)</param>
/// <param name="lParam">lParam points to a KBDLLHOOKSTRUCT structure containing details about the key event</param>
/// <returns></returns>
LRESULT CALLBACK KeyPressesManager::lowLevelKeyboardPressCallback(int nCode, WPARAM wParam, LPARAM lParam) {
    if (nCode == HC_ACTION) {
        KBDLLHOOKSTRUCT* pkbhs = (KBDLLHOOKSTRUCT*)lParam;
        if (wParam == WM_KEYDOWN) {
            bool ctrl_is_pressed = GetAsyncKeyState(VK_CONTROL) & 0x8000;
            bool shift_is_pressed = GetAsyncKeyState(VK_SHIFT) & 0x8000;

            // first checking whether a combination of ctr/shift + some other key is pressed
            if (ctrl_is_pressed) {
                logFile_ << "Ctrl+" << pkbhs->vkCode << " pressed" << std::endl;
            }
            else if (shift_is_pressed) {
                logFile_ << "Shift+" << pkbhs->vkCode << " pressed" << std::endl;
            }
            else {
                // only a single key is pressed
                logFile_ << "Key Down: " << pkbhs->vkCode << std::endl;
            }
        }
    }
    return CallNextHookEx(globalHandleKeyboardHook, nCode, wParam, lParam);
}

/// <summary>
/// Manages the lifecycle of the keyboard hook.
/// Installs the hook using SetWindowsHookEx, specifying WH_KEYBOARD_LL for a low-level keyboard hook 
/// and passing LowLevelKeyboardProc as the callback function.
/// </summary>
void KeyPressesManager::setGlobalKeyboardHook() {
    globalHandleKeyboardHook = SetWindowsHookEx(WH_KEYBOARD_LL, lowLevelKeyboardPressCallback, nullptr, 0);
    if (globalHandleKeyboardHook == NULL) {
        std::cerr << "Failed to install keyboard hook!" << std::endl;
    }
}

/// <summary>
/// Manages the lifecycle of the keyboard hook.
/// Removes the hook with UnhookWindowsHookEx, ensuring the hook is deactivated when no longer needed.
/// </summary>
void KeyPressesManager::unsetGlobalKeyboardHook() {
    if (globalHandleKeyboardHook != NULL) {
        UnhookWindowsHookEx(globalHandleKeyboardHook);
        globalHandleKeyboardHook = NULL;
    }
}