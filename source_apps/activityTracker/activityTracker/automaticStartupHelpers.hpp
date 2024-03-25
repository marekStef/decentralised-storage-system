#ifndef _AUTOMATIC_STARTUP_HELPERS_HPP_
#define _AUTOMATIC_STARTUP_HELPERS_HPP_

#include <windows.h>
#include <string>

bool addAppToAutomaticStartupAppsList();

bool RemoveAppFromStartup();

bool IsAppInStartupList();

#endif // !_AUTOMATIC_STARTUP_HELPERS_HPP_
