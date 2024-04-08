#ifndef _TIME_HELPERS_HPP_
#define _TIME_HELPERS_HPP_

#include <string>
#include <chrono>

// ISO 8601 date
static std::string GetCurrentISODate() {
    auto now = std::chrono::system_clock::now();
    auto timeT = std::chrono::system_clock::to_time_t(now);
    auto millisec_since_epoch = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count();
    auto millisec_part = millisec_since_epoch % 1000;

    std::tm bt;
    gmtime_s(&bt, &timeT);

    std::ostringstream oss;
    oss << std::put_time(&bt, "%Y-%m-%dT%H:%M:%S");
    oss << '.' << std::setfill('0') << std::setw(3) << millisec_part << "Z";

    return oss.str();
}

static std::string GetCurrentDateForPath() {
    auto now = std::chrono::system_clock::now();
    auto timeT = std::chrono::system_clock::to_time_t(now);
    auto millisec_since_epoch = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count();
    auto millisec_part = millisec_since_epoch % 1000;

    std::tm bt;
    gmtime_s(&bt, &timeT);

    std::ostringstream oss;
    oss << std::put_time(&bt, "%Y-%m-%d_T%H-%M-%S");
    oss << '.' << std::setfill('0') << std::setw(3) << millisec_part << "Z";

    return oss.str();
}

#endif // !_TIME_HELPERS_HPP_
