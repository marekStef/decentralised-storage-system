#include <iostream>

#include <windows.h>
#include <gdiplus.h>
#include <vector>
#include <string>
#include <stdexcept>
#include <filesystem>
#include <locale> // todo : not needed
#include <codecvt>
//#include "httplib.h"
#include <curl/curl.h>

#include <filesystem> // for merging paths
#include <chrono>

#include "screenshots_manager.hpp"
#include "screenshots_manager_constants.hpp"

#pragma comment(lib, "gdiplus.lib")

/*
    Helper functions [START]
*/

std::string generate_unique_image_name(int index) {
    auto now = std::chrono::system_clock::now();
    auto now_sec = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch());
    auto now_sec_str = std::to_string(now_sec.count());

    std::stringstream ss;
    ss << "monitor-" << index << "-";
    ss << now_sec_str;
    //ss << std::put_time(now_tm, "%Y%m%d_%H%M%S");
    std::srand(std::time(nullptr)); // Seed the random number generator and add a random component to the filename
    int random_number = std::rand();
    ss << "_" << random_number << "." << DESIRED_IMAGE_TYPE_STR;
    return ss.str();
}

/*
    Helper functions [END]
*/

/*
* GDI+ (Graphics Device Interface Plus) is a graphical subsystem of Windows that provides two-dimensional graphics, 
* imaging, and typography capabilities to software developers. 
*
* It serves as an enhancement over its predecessor, GDI (Graphics Device Interface), 
* offering improved graphics rendering quality and advanced features. Introduced with Windows XP and available in 
* later versions of Windows, GDI+ allows developers to work with graphics in a more sophisticated manner than was 
* possible with the older GDI framework.
* 
* Key features:
*   - 2D Graphics Rendering
*   - Imaging and Image Processing: It supports loading, saving, and manipulating images in 
      different formats (BMP, JPEG, GIF, TIFF, PNG, etc.). GDI+ offers functions for 
      performing operations like scaling, cropping, rotating, and applying effects to images
*   - Advanced Typography
*   - Alpha Blending
*   - Antialiasing


*/

/// <summary>
/// Initializes an instance of the ScreenshotsManager class, 
/// setting the output directory for saved screenshots and configuring the process's DPI awareness.
/// This is to ensure screenshots match the actual display resolution on high DPI settings.
/// </summary>
/// <param name="output_directory"></param>
ScreenshotsManager::ScreenshotsManager(const std::filesystem::path& output_directory) : output_dir_(output_directory) {
    // Attempting to set the process as per-monitor DPI aware ( crucial for getting accurate screenshots across multiple monitors )
    if (!SetProcessDpiAwarenessContext(DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE)) {
        SetProcessDPIAware(); // fallback
    }

    encoder_params.Count = 1;
    encoder_params.Parameter[0].Guid = Gdiplus::EncoderQuality;
    encoder_params.Parameter[0].Type = Gdiplus::EncoderParameterValueTypeLong;
    encoder_params.Parameter[0].NumberOfValues = 1;
    encoder_params.Parameter[0].Value = &IMAGE_QUALITY_LEVEL;
};

/// <summary>
/// Callback function for EnumDisplayMonitors - gathers info about monitor
/// </summary>
/// <param name="hMonitor">
///     A handle to the monitor being enumerated.
///     This handle is a unique identifier for the monitor in the context of the system's display environment.
/// </param>
/// <param name="hdcMonitor">
///     (hdc - Handle to Device Context)
///     A handle to a device context that corresponds to the monitor being enumerated. 
///     A device context is an abstract representation of a drawing surface. 
///     This particular device context can be used to draw on the monitor or query specific graphics-related information about the monitor.
/// </param>
/// <param name="lprcMonitor">
///     (LPRECT - Long Pointer to RECT (Long is there for historical reasons (segmented memory model in win 3)).
///     RECT structure that specifies the display boundaries of the monitor.
/// </param>
/// <param name="dwData">
///     An application-defined value that is passed to the EnumDisplayMonitors function when it's called.
///     In this case, we expect it to be pointer to the vector of `MonitorInfo`s
/// </param>
/// <returns>BOOL</returns>
BOOL CALLBACK MonitorEnumProc(HMONITOR hMonitor, HDC hdcMonitor, LPRECT lprcMonitor, LPARAM dwData) {
    std::vector<MonitorInfo>* monitors = reinterpret_cast<std::vector<MonitorInfo>*>(dwData);
    MonitorInfo monitorInfo = { hMonitor, *lprcMonitor };
    monitors->push_back(monitorInfo);
    return TRUE;
}

/// <summary>
///     Enumerates all the monitors connected to the system and stores their information for later use
/// </summary>
/// <returns>vector of information about each monitor</returns>
std::vector<MonitorInfo> ScreenshotsManager::get_all_monitors() const {
    std::vector<MonitorInfo> monitors;
    BOOL result = EnumDisplayMonitors(NULL, NULL, MonitorEnumProc, (LPARAM)&monitors);
    if (!result)
        throw std::runtime_error("Failed to enumerate monitors. Error code: " + std::to_string(GetLastError()));
    return monitors;
}

bool compare_wide_character_strings(const wchar_t* str1, const wchar_t* str2) {
    // wcscmp for comparing two wide-character strings (supports unicode)
    return wcscmp(str1, str2) == 0;
}

/// <summary>
///     Retrieves the CLSID (class identifier) of the encoder for the specified image format.
///     Compares the MIME type of each image encoder (retrieved from the ImageCodecInfo structures) 
///     against the desired format specified by the format parameter.
///     CLSID is used to identify the specific encoder for the image format you wish to save your image in, such as BMP, JPEG, GIF, etc.
///     This CLSID is then used by GDI+(Graphics Device Interface Plus) functions to save an image in that format.
/// 
///     GDI+ allows for loading and saving images in different formats (JPEG, BMP, PNG, etc.), 
///     but to do so, it requires specific encoder information for the desired image format.
/// </summary>
/// <param name="format">Encoder with MIME type set to format is returned</param>
/// <param name="pClsid"></param>
/// <returns>-1 if encoder with mime type equal to format not found. Other number otherwise.</returns>
void get_encoder_clsid(const WCHAR* format, CLSID* pClsid) {
    if (format == nullptr || pClsid == nullptr)
        throw std::invalid_argument(PARAMETER_NULL_MESSAGE);
    UINT num = 0;
    UINT size = 0;

    Gdiplus::ImageCodecInfo* pImageCodecInfo = nullptr;
    // retrieves the number of image encoders available on the system and the size, in bytes, of the array that will contain them 
    Gdiplus::Status status = Gdiplus::GetImageEncodersSize(&num, &size);
    if (status != Gdiplus::Ok || size == 0)
        throw std::runtime_error(FAILED_TO_GET_IMAGE_ENCODERS_MESSAGE);

    pImageCodecInfo = (Gdiplus::ImageCodecInfo*)(malloc(size)); // allocated size for encoders
    if (pImageCodecInfo == nullptr)
        throw std::bad_alloc();

    status = GetImageEncoders(num, size, pImageCodecInfo); // populate the allocated memory with information about each available encoder
    if (status != Gdiplus::Ok) {
        free(pImageCodecInfo); // Ensure memory is freed before throwing
        throw std::runtime_error(FAILED_TO_GET_IMAGE_ENCODERS_MESSAGE);
    }

    bool encoder_found = false;

    for (UINT j = 0; j < num; ++j) {
        Gdiplus::ImageCodecInfo& current_image_codec_info = pImageCodecInfo[j];
        if (compare_wide_character_strings(current_image_codec_info.MimeType, format)) {
            *pClsid = current_image_codec_info.Clsid;
            encoder_found = true;
            break;
        }
    }

    free(pImageCodecInfo);
    if (!encoder_found) {
        throw std::runtime_error(FAILED_TO_GET_IMAGE_ENCODER_MESSAGE);
    }
}

/// <summary>
///     Captures a screenshot of a specific monitor and saves it as an image file.
/// </summary>
/// <param name="monitorInfo"></param>
/// <param name="monitorIndex"></param>
void ScreenshotsManager::capture_monitor(const MonitorInfo& monitorInfo, const std::filesystem::path& output_filename) const {
    // A Device Context (DC) is a Windows construct that represents a set of graphic objects and their 
    // associated attributes, along with the graphic modes that affect output. 
    //  The DC is an abstraction that allows applications to draw on devices like monitors, printers, 
    // or files in a device-independent manner.
    HDC hScreenDC = GetDC(NULL); // retrieves the device context (DC) for the entire screen.
    if (!hScreenDC)
        throw std::runtime_error(FAILED_TO_GET_DEVICE_CONTEXT_MESSAGE);
    // It's a handle to the display device context of the entire screen.
    HDC hMemoryDC = CreateCompatibleDC(hScreenDC);
    if (!hMemoryDC) {
        ReleaseDC(NULL, hScreenDC);
        throw std::runtime_error(FAILED_TO_GET_DEVICE_CONTEXT_MESSAGE);
    }
    // Creates a memory device context (DC) that is compatible with the screen DC. 
    //  This memory DC is used as a canvas to draw or capture the screenshot, which can then be manipulated 
    // or saved into a file. It's an off-screen bitmap that operations can be performed on without affecting the 
    // user's screen.
    //  It's often used for creating complex images in memory before displaying them or, as in this scenario, 
    // for capturing the screen content without directly affecting the visible output.

    // calculate dimensions
    int width = monitorInfo.rect.right - monitorInfo.rect.left;
    int height = monitorInfo.rect.bottom - monitorInfo.rect.top;


    HBITMAP hBitmap = CreateCompatibleBitmap(hScreenDC, width, height); // this bitmap temporarily stores the screenshot
    if (!hBitmap) {
        DeleteDC(hMemoryDC);
        ReleaseDC(NULL, hScreenDC);
        throw std::runtime_error(COMPATIBLE_BITMAP_CREATE_FAILED_MESSAGE);
    }
    // Before drawinh on the memory DC, i need to select a bitmap into it where the drawing will be stored. 
    // This step selects the newly created bitmap as the drawing surface for the memory DC. 
    // The function also returns a handle to the previously selected bitmap in the DC, typically a default 1x1 pixel bitmap.

    // The memory DC initially has a 1x1 monochrome bitmap selected by default (a placeholder), which is not suitable for capturing a screenshot.
    HBITMAP hOldBitmap = (HBITMAP)SelectObject(hMemoryDC, hBitmap);
    if (!hOldBitmap) {
        DeleteObject(hBitmap);
        DeleteDC(hMemoryDC);
        ReleaseDC(NULL, hScreenDC);
        throw std::runtime_error(SELECTION_OF_BITAMAP_TO_DC_FAILED_MESSSAGE);
    }
    try {
        // BitBlt stands for Bit Block Transfer, and it efficiently transfers color data from the source (screen) 
        // to the destination (memory bitmap)
        if (!BitBlt(hMemoryDC, 0, 0, width, height, hScreenDC, monitorInfo.rect.left, monitorInfo.rect.top, SRCCOPY)) 
            throw std::runtime_error(BIT_BLT_FAILED_MESSAGE);
        // copies the content from the specified region of the screen DC (representing the monitor area) into 
        // the memory DC. The dimensions and position are based on the MonitorInfo structure, 
        // which defines the area of the screen to capture. 

        // After the BitBlt operation, the original (default) bitmap is selected back into the memory DC
        // to properly manage memory and resources. 
        // Meant for cleanup of the DC and bitmap objects.
        hBitmap = (HBITMAP)SelectObject(hMemoryDC, hOldBitmap);

        Gdiplus::Bitmap bitmap(hBitmap, nullptr);
        CLSID bmpClsid;
        get_encoder_clsid(DESIRED_OUTPUT_IMAGE_MIME_TYPE, &bmpClsid);
        const wchar_t* output_filename_wchar_pointer = output_filename.c_str();
        Gdiplus::Status result = bitmap.Save(output_filename_wchar_pointer, &bmpClsid, &encoder_params);
        if (result != Gdiplus::Ok)
            throw std::runtime_error(FAILED_TO_SAVE_BITMAP_MESSAGE);
    }
    catch (...) {
        // delete created memory dc and rease the screen dc
        DeleteDC(hMemoryDC);
        ReleaseDC(NULL, hScreenDC);
        // delete the bitmap used for capturing the screenshot
        DeleteObject(hBitmap);
        throw;
    }
    // delete created memory dc and rease the screen dc
    DeleteDC(hMemoryDC);
    ReleaseDC(NULL, hScreenDC);
    // delete the bitmap used for capturing the screenshot
    DeleteObject(hBitmap);
}

/// <summary>
/// Takes screenshots of all connected screens.
/// </summary>
/// <param name="output_dir">Directory where images will be saved</param>
/// <returns>vector of output filepaths</returns>
std::vector<std::filesystem::path> ScreenshotsManager::take_screenshots_of_all_screens() const {
    // GDI+ requires initialization before any GDI+ functions or classes are used and a corresponding shutdown 
    // when those operations are complete. 
    Gdiplus::GdiplusStartupInput gdiplusStartupInput;
    ULONG_PTR gdiplusToken;
    Gdiplus::Status result = GdiplusStartup(&gdiplusToken, &gdiplusStartupInput, NULL);
    // After calling GdiplusStartup, GDI+ functionalities are available globally within the application process.

    auto monitors = get_all_monitors();

    std::vector<std::filesystem::path> output_filepaths;
    for (size_t i = 0; i < monitors.size(); ++i) {
        std::filesystem::path image_name = generate_unique_image_name(i);

        std::filesystem::path path_to_output_image = output_dir_ / image_name;
        capture_monitor(monitors[i], path_to_output_image);
        output_filepaths.push_back(path_to_output_image);
    }

    Gdiplus::GdiplusShutdown(gdiplusToken);
    return output_filepaths;
}

bool ScreenshotsManager::upload_screenshots_to_server(const std::vector<std::filesystem::path>& image_paths) const {
    return true;
}