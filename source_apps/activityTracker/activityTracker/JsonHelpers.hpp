#ifndef _JSON_HELPERS_HPP_
#define _JSON_HELPERS_HPP_

#include <fstream> 
#include <nlohmann/json.hpp>
#include <string>
#include <iostream>

using json = nlohmann::json;

void saveJsonToFile(const json& j_data, const std::string& file_path) {
    std::ofstream file(file_path);

    if (file.is_open()) {
        file << j_data.dump(4);
        file.close();
    }
    else {
        std::cerr << "Could not open file " << file_path << " for writing.\n";
    }
}

#endif // !_JSON_HELPERS_HPP_
