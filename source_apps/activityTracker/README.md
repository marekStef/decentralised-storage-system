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

And also `wxwidgets`:

```bash
C:\dev\vcpkg>.\vcpkg install wxwidgets
```

Now we are able to use run the project.
