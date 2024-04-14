#ifndef _NETWORK_MANAGER_HPP__
#define _NETWORK_MANAGER_HPP__

#include <string>
#include <vector>

class NetworkManager {
public:
	std::vector<std::string> getCurrentSSIDs();
};

#endif // !_NETWORK_MANAGER_HPP_
