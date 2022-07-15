# Git Project Manager

[![Build Status](https://travis-ci.org/felipecaputo/git-project-manager.svg?branch=master)](https://travis-ci.org/felipecaputo/git-project-manager)

Git Project Manager (GPM) is a Microsoft VSCode extension that allows you to open a **new window targeting a git repository** directly from the VSCode window.

## Available commands

Currently there are 3 avaliable commands, all of them can be accessed via the VSCode [command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) (`Ctrl+Shift+P` on Windows and 
`Cmd+Alt+P` on Mac) by typing **GPM**.

### GPM: Open Git Project *(Defaults to: `Ctrl+Alt+P`)*
Shows a list of the available git repositories in all folders configured in **`"gitProjectManager.baseProjectsFolders"`**.
The first time its opened, it searches all folders, after that it uses a cached repository info.

![open Git Project](/img/openProject.gif)


### GPM: Refresh Projects
This command refreshes the cached repositories info for all configured folders.

### GPM: Refresh specific project folder
This command allows you to select a specific folder and refresh its repositories, without
refreshing all folders.

### GPM: Open Recent Git Project *(Defaults to `Ctrl+Shift+Q`)*
This command opens a list of your most recent git projects, letting you swap even faster between them.

The size of the list is configured in `"gitProjectManager.recentProjectsListSize"`.

## Available settings

Before you can start using GPM, you need to configure the base folders that the extension will use to
search for git repositories. Edit `settings.json` from the **File -> Preferences -> Settings** and add the
following config:

```json
    {
        "gitProjectManager.baseProjectsFolders": [
            "/home/user/nodeProjects",
            "/home/user/personal/pocs"
        ]
    }
 ```

Another available configuration is `"gitProjectManager.storeRepositoriesBetweenSessions"` that allows
git repositories information to be stored between sessions to avoid the waiting time when you first load the repositories list. It's set to `false` by default.

 ```json
    {
        "gitProjectManager.storeRepositoriesBetweenSessions": true
    }
```

To improve performance there are 2 new and important configurations:

1. **ignoredFolders**: an array of folder names that will be ignored (*node_modules for example*)

    ```json
    {
        "gitProjectManager.ignoredFolders": ["node_modules"]
    }
    ```

2. **maxDepthRecursion**: indicates the maximum recursion depth that will be searched starting in the configured folder (default: `2`)

    ```json
    {
        "gitProjectManager.maxDepthRecursion": 4
    }
    ```

In version 0.1.10 we also added the `"gitProjectManager.checkRemoteOrigin"`
configuration that allows users to not check remote repository origin
to improve performance:

 ```json
    {
        "gitProjectManager.checkRemoteOrigin": false
    }
```

Added in version 0.1.12, you can configure the behavior when opening a project if it will be opened in the same window
or in a new window. (*this option is ignored if there aren't any opened folders in current window*)):

```json
    {
        "gitProjectManager.openInNewWindow": false
    }
 ```

## Participate

If you have any idea, feel free to create issues and pull requests.
