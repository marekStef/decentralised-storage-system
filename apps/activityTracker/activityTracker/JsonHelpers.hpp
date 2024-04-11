#ifndef _JSON_HELPERS_HPP_
#define _JSON_HELPERS_HPP_

#include <fstream> 
#include <nlohmann/json.hpp>
#include <string>
#include <iostream>
#include <filesystem>

using json = nlohmann::json;
namespace fs = std::filesystem;

static void saveJsonToFile(const json& j_data, const std::string& file_path) {
    fs::path dir_path = fs::path(file_path).parent_path();

    if (!dir_path.empty() && !fs::exists(dir_path)) {
        if (!fs::create_directories(dir_path)) {
            std::cerr << "Failed to create directories for path " << dir_path << "\n";
            return;
        }
    }

    std::ofstream file(file_path);

    if (file.is_open()) {
        file << j_data.dump(4);
        file.close();
    }
    else {
        std::cerr << "Could not open file " << file_path << " for writing.\n";
    }
}

static json loadJsonSchema(const std::string& path) {
    std::ifstream file(path);
    if (!file.is_open()) {
        throw std::runtime_error("Could not open file " + path);
    }
    nlohmann::json schema;
    file >> schema;
    return schema;
}

static json loadActivityTrackingEventProfileSchema() {
    return loadJsonSchema("resources/activityTrackingEventProfileSchema.json");
}

#endif // !_JSON_HELPERS_HPP_
