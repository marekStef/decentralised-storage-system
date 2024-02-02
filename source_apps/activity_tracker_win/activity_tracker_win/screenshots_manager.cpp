#include <windows.h>
#include <gdiplus.h>
#include <vector>
#include <string>

#include "screenshots_manager.hpp"

#pragma comment(lib, "gdiplus.lib")

using namespace Gdiplus;

ScreenshotsManager::ScreenshotsManager(const std::string& output_directory) : output_dir_(output_directory) {};


BOOL CALLBACK MonitorEnumProc(HMONITOR hMonitor, HDC hdcMonitor, LPRECT lprcMonitor, LPARAM dwData) {
    std::vector<MonitorInfo>* monitors = reinterpret_cast<std::vector<MonitorInfo>*>(dwData);
    MonitorInfo monitorInfo = { hMonitor, *lprcMonitor };
    monitors->push_back(monitorInfo);
    return TRUE;
}

std::vector<MonitorInfo> ScreenshotsManager::get_all_monitors() {
    std::vector<MonitorInfo> monitors;
    EnumDisplayMonitors(NULL, NULL, MonitorEnumProc, (LPARAM)&monitors);
    return monitors;
}

int get_encoder_clsid(const WCHAR* format, CLSID* pClsid) {
    UINT num = 0;
    UINT size = 0;

    ImageCodecInfo* pImageCodecInfo = nullptr;
    GetImageEncodersSize(&num, &size);
    if (size == 0) return -1;

    pImageCodecInfo = (ImageCodecInfo*)(malloc(size));
    if (pImageCodecInfo == nullptr) return -1;

    GetImageEncoders(num, size, pImageCodecInfo);
    for (UINT j = 0; j < num; ++j) {
        if (wcscmp(pImageCodecInfo[j].MimeType, format) == 0) {
            *pClsid = pImageCodecInfo[j].Clsid;
            free(pImageCodecInfo);
            return j;
        }
    }
    free(pImageCodecInfo);
    return -1;
}

void ScreenshotsManager::capture_monitor(MonitorInfo monitorInfo, int monitorIndex) const {
    HDC hScreenDC = GetDC(NULL);
    HDC hMemoryDC = CreateCompatibleDC(hScreenDC);
    int width = monitorInfo.rect.right - monitorInfo.rect.left;
    int height = monitorInfo.rect.bottom - monitorInfo.rect.top;
    HBITMAP hBitmap = CreateCompatibleBitmap(hScreenDC, width, height);
    HBITMAP hOldBitmap = (HBITMAP)SelectObject(hMemoryDC, hBitmap);

    BitBlt(hMemoryDC, 0, 0, width, height, hScreenDC, monitorInfo.rect.left, monitorInfo.rect.top, SRCCOPY);
    hBitmap = (HBITMAP)SelectObject(hMemoryDC, hOldBitmap);

    Bitmap bitmap(hBitmap, nullptr);
    CLSID bmpClsid;
    get_encoder_clsid(L"image/bmp", &bmpClsid);

    wchar_t filename[100];
    wsprintfW(filename, L"screenshot_monitor_%d.bmp", monitorIndex);
    bitmap.Save(filename, &bmpClsid, nullptr);

    DeleteDC(hMemoryDC);
    ReleaseDC(NULL, hScreenDC);
    DeleteObject(hBitmap);
}

void ScreenshotsManager::take_screenshots_of_all_screens() {
    GdiplusStartupInput gdiplusStartupInput;
    ULONG_PTR gdiplusToken;
    GdiplusStartup(&gdiplusToken, &gdiplusStartupInput, NULL);

    auto monitors = get_all_monitors();

    for (size_t i = 0; i < monitors.size(); ++i) {
        capture_monitor(monitors[i], i);
    }

    GdiplusShutdown(gdiplusToken);
}
