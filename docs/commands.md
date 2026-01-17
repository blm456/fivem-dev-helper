# Commands

You can just run `fivem-dev` for a menu based approach, but the commands allow for faster execution of the helper.

You can also use `fivem-dev help [command]` for a list of options in the CLI.

| Command           |
| :---------------- |
| [cfg](#cfg)       |
| [init](#init)     |
| [remove](#remove) |
| [run](#run)       |
| [update](#update) |

## Cfg

### Description

Manages CFG presets for the `server.cfg` file for quick changes between settings.

### Usage

### Options

| Name      | Description                                                                                     | Arguments                                                                                    | Example                         |
| :-------- | :---------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- | :------------------------------ |
| `list`    | List all the saved presets that currently exist.                                                | _None_                                                                                       | `fivem-dev cfg list`            |
| `save`    | Saves the current `server.cfg` in your resources folder as a preset.                            | `--overwrite` Overwrites the current saved preset<br>`<name>` The name to same the preset as | `fivem-dev cfg save live-cfg`   |
| `load`    | Loads the saved config file to your resources folder and backs up the current one if it exists. | `<name>` The name of the resource to load                                                    | `fivem-dev cfg load live-cfg`   |
| `delete`  | Deletes the config file preset                                                                  | `<name>` The name of the preset to delete.                                                   | `fivem-dev cfg delete live-cfg` |
| `default` | Loads in the default FiveM server.cfg file.                                                     | _None_                                                                                       | `fivem-dev cfg default`         |

## Init

### Description

Initializes a new project and guides through the config. Required to run first before the helper can be used.

### Usage

`fivem-dev init`

## Remove

Removes the project configuration and data from your project.

## Run

Same as just running `fivem-dev` and displays the command line UI.

## Update

### Description

Runs the auto updater of FiveM server files and places them in your configured binaries folder.

### Arguments

| Name                | Description                                                                                                                                 | Required | Example                             |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------ | :------: | :---------------------------------- |
| `--no-install`      | Checks the FiveM changelog for a newer version but will not install them if found, just print out the current and old version number.       |    ❌    | `fivem-dev update --no-install`     |
| `--channel` or `-c` | Define the channel to download the FiveM version from instead of what is in your project config. (latest, recommended, optional, critical). |    ❌    | `fivem-dev update --channel latest` |
| `--force` or `-f`   | Forces the binaries to update if the version is the same in case of corruption of the cache or server files.                                |    ❌    | `fivem-dev update --force`          |
