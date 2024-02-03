This C++ needs curl library to be compiled.

Instructions for adding curl library:
Look at the first part of this video:
https://www.youtube.com/watch?v=q_mXVZ6VJs4

<!-- 1. Clone this curl project from github - `https://github.com/curl/curl`
2. Open `Developer Command Prompt for VS 2022`
3. Run `${curl-dir}> buildconf.bat`
4. Then, from the winbuild directory, start the build with the following commands.
5. `${curl-dir}> cd winbuild`
6. `${curl-dir}\winbuild> nmake /f Makefile.vc mode=static`

Now we will add some things to VS from this directory `curl\builds\libcurl-vc-x86-release-static-ipv6-sspi-schannel`

In Visual Studio:
1. Open `Project Properties`
2. Go to `C/C++` and add `[path to curl]\curl\builds\libcurl-vc-x86-release-static-ipv6-sspi-schannel\include` to `Additional Include Directories`
3. Go to `Linker`, into `General`
4. Add `[path to curl]\curl\builds\libcurl-vc-x86-release-static-ipv6-sspi-schannel\lib` to `Additional Library Dependencies`
5. You are good to go! -->