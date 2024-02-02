#ifndef _NETWORK_MANAGER_HPP_
#define _NETWORK_MANAGER_HPP_

#include <string>
#include <vector>

class NetworkManager {
public:
	std::vector<std::string> get_current_SSIDs();
};

#endif // !_NETWORK_MANAGER_HPP_
