1. Initialize the app if this is the first run:
   - [ ] Create project configuration:
     - [x] Absolute location of the server binaries
     - [x] Absolute location of the resources folder
     - [ ] Define startup arguments for dev environment (Optional)
     - [ ] Define startup arguments for release environment (Optional)
     - [x] FiveM server file release type to download and system type is linux or windows (Default latest)
     - [ ] Server file auto update interval (Default one week but can be disabled)
     - [ ] Define dev server "server.cfg" options
     - [ ] Define release server "server.cfg" options (Optional but required before compiling a release)
     - [ ] Download server binaries as defined
2. Check for auto update if enough time has passed from last update and auto update is enabled
3. Main menu using inquirer:
   - [ ] Start dev server environment (Creates a temporary server.cfg file to start the server then starts the server in a new CMD window to continue using the app. If dev server is running this becomes "Stop dev server" and deletes the cache folder when stopped)
   - [ ] Check for update (resets the auto update interval but does not check it before looking for update)
   - [ ] Edit config
   - [ ] Edit server.cfg (Ask if dev or release config, then allow for editing options and selecting resources from resource folder to run. Resources have a folder name without spaces, and folders with names in square brackets can have more resources inside of them)
   - [ ] Compile (Creates the server.cfg and start.bat files and copies selected resources into a defined location with option top put in a .zip file for easy file transfer)
     - [ ] Dev environment
     - [ ] Release environment
   - [ ] Create resource template (Ask for type below, then location to create the template and the name of the script which will be the name of the folder the template is placed in)
     - [ ] Normal resource (using typescript)
     - [ ] NUI resource (Normal resource but with a html folder for a React based NUI)
     - [ ] Loading screen resource (React based loading screen for when players are joining the server)
   - [ ] Compile types (This is the more complicated piece. Can be either project wide or just for a resource. Scans a resource's "global" folder containing "client" "server" and "shared" typescript files exporting classes, objects, types, and interfaces that should be compiled and available for each resource in the project through a config defined name then the resource name. For example, if the config defined name is "purely- [ ]rp" and the resource name is "core" with a class "Player" in the "global/client" folder every project should be able to import the class by having "import { Player } from "@purely- [ ]rp/core")
