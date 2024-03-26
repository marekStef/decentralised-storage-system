You need to have a vcpkg installed on your computer in a directory such as `C:\dev`. You need to have visual studio build tools installed.

```bash
git clone https://github.com/Microsoft/vcpkg.git
```

then run :

```bash
C:\dev\vcpkg>.\bootstrap-vcpkg.bat
```

then ( this requires administrator access )

```bash
C:\dev\vcpkg>.\vcpkg.exe integrate install
Applied user-wide integration for this vcpkg root.
CMake projects should use: "-DCMAKE_TOOLCHAIN_FILE=C:/dev/vcpkg/scripts/buildsystems/vcpkg.cmake"

All MSBuild C++ projects can now #include any installed libraries. Linking will be handled automatically. Installing new libraries will make them instantly available.

C:\dev\vcpkg>
```

We need to remember `-DCMAKE_TOOLCHAIN_FILE=C:/dev/vcpkg/scripts/buildsystems/vcpkg.cmake` for later use.

In `vcpkg` we need to install `curl`:

```bash
C:\dev\vcpkg>.\vcpkg.exe install curl
```

Also `wxwidgets`:

```bash
C:\dev\vcpkg>.\vcpkg install wxwidgets
```

And also `nlohmann-json`:

```bash
C:\dev\vcpkg>.\vcpkg install nlohmann-json
```

Result should be the following: 

```bash
Elapsed time to handle nlohmann-json:x64-windows: 12 s
nlohmann-json:x64-windows package ABI: 95633b8655b89381dba0bc50317522a9802d5e0f98e0491768eaca4ef432660e
Total install time: 12 s
The package nlohmann-json provides CMake targets:

    find_package(nlohmann_json CONFIG REQUIRED)
    target_link_libraries(main PRIVATE nlohmann_json::nlohmann_json)

The package nlohmann-json can be configured to not provide implicit conversions via a custom triplet file:

    set(nlohmann-json_IMPLICIT_CONVERSIONS OFF)

For more information, see the docs here:

    https://json.nlohmann.me/api/macros/json_use_implicit_conversions/

```

Now we are able to use run the project.

--- 

IMPORTANT:

### Browser Tabs Info Is Not Gathered

Enumerating browser tabs directly from standalone C++ code presents significant challenges due to the architecture of web browsers and the security models they employ. It is not straightforwardly achievable to obtain this data through conventional means like those used for enumerating top-level windows with the Windows API.

1. Process and Window Management
Modern operating systems and their graphical subsystems, such as those in Windows OS, distinguish between processes and the windows they create. Tools and APIs are provided to enumerate these windows, obtain window titles, and perform other related tasks. However, this model primarily applies to top-level windows — that is, windows that are directly managed by the operating system's window manager.

Web browsers, on the other hand, often manage tabs internally within a single process and window. Each tab does not correspond to a separate top-level window in the traditional sense but rather is an internal construct of the browser application itself. This design allows browsers to efficiently manage resources, such as sharing processes for rendering or JavaScript execution across multiple tabs, and implement features like tab isolation and recovery from crashes within a single tab.

2. Security and Privacy Concerns
Web browsers are designed with strong security and privacy considerations, especially given their role in accessing and managing sensitive user data across the internet. Allowing external applications to enumerate and access information about open tabs could pose significant privacy risks and potentially expose users to malicious activities. As a result, browsers are designed to sandbox such information, restricting access to it from outside the browser process.

Also discusses [here](https://stackoverflow.com/questions/40608529/enumwindow-to-catch-tab-process-google-chrome-c)