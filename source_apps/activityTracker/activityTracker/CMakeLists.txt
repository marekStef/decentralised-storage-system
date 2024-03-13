# CMakeList.txt : CMake project for activityTracker, include source and define
# project specific logic here.
#

# Add source to this project's executable.
add_executable (activityTracker "activityTracker.cpp" "activityTracker.h")

if (CMAKE_VERSION VERSION_GREATER 3.12)
  set_property(TARGET activityTracker PROPERTY CXX_STANDARD 20)
endif()

# TODO: Add tests and install targets if needed.
