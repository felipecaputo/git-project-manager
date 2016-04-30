# Git Project Manager [![Build Status](https://travis-ci.org/felipecaputo/git-project-manager.svg?branch=master)](https://travis-ci.org/felipecaputo/git-project-manager)

Git Project Manager (GPM) is a Microsoft VSCode extension that allows you to open a **new window targeting a git repository** directly from VSCode window.

##Available settings

Before start using GPM you need to configure the base folders that the extension will
search for git repositories. you need to open **File -> Preferences -> User Settings**  


    {
        "gitProjectManager.baseProjectsFolders": [
            "/home/user/nodeProjects",
            "/home/user/personal/pocs"
        ]
    }

Another available configuration is **gitProjectManager.storeRepositoriesBetweenSessions** that allows
git repositories information to be stored between sessions, avoiding the waiting time in the first
time you load the repositories list. It's **false** by default.


    {
        "gitProjectManager.storeRepositoriesBetweenSessions": true
    }

If nothing happens when trying to open a found project it could be due to the Code command being used. To work around this issue set **gitProjectManager.codePath** to the full path of the Code command to use when launching new instances.
This configuration can be defined in 3 formats (*this was done to solve issue #7*):

**First:** Define it as a simple string, with the path to code app

    //Windows
    {
        "gitProjectManager.codePath": "C:\\Program Files (x86)\\Microsoft VS Code\\bin\\code.cmd"
    }
    
    //Linux
    {
        "gitProjectManager.codePath": "/usr/local/bin/code"
    }
    
**Second:** Use a object notation to define the path to code path on each platform

    {
        "gitProjectManager.codePath" : {
            "windows": "C:\\Program Files (x86)\\Microsoft VS Code\\bin\\code.cmd",
            "linux": "/usr/local/bin/code"
        }
    }
    
**Third:** An array of file paths, where at least one is a valid path

    {
        "gitProjectManager.codePath" : [
            "C:\\Program Files (x86)\\Microsoft VS Code\\bin\\code.cmd",
            "/usr/local/bin/code"
        ]
    }
    
To improve performance there are 2 new and important configurations that are:  
**ignoredFolders**: an array of folder names that will be ignored (*node_modules for example*)

    {
        "gitProjectManager.ignoredFolders": ["node_modules"]
    }

**maxDepthRecursion**: indicates the maximum recursion depth that will be searched starting in the configured folder

    {
        "gitProjectManager.maxDepthRecursion": 4
    }
    

In version 0.1.10 we also added the **"gitProjectManager.checkRemoteOrigin"** 
configuration that allows users to not check remote repository origin 
to improve performance

    {
        "gitProjectManager.checkRemoteOrigin": false
    }
    
##Available commands

Currently there are 3 avaliable commands, all of them can be accessed via **Ctrl+Shift+P** 
*(Cmd+Shift+P on Mac)* typing **GPM**

###GPM: Open Git Project *(Ctrl+Alt+P)*
Show a list of the available git repositories in all folders configured in **gitProjectManager.baseProjectsFolders**.
The first time it searchs all folders, after that it uses a cached repository info.
![open Git Project](/img/openProject.gif)


###GPM: Refresh Projects
This commands refresh the cached repositories info for all configured folders.

###GPM: Refresh specific project folder
This commands allows you to select a specific foledr to refresh its repositories, without
refreshing all folders.

##Change log

###0.1.11
  - Now it only shows the folder name instead of the complete path, and also, if *checkRemoteOrigin* is
  false, then it show the path as pick list description instead of remote origin
  - Changed the way we can configure codePath

### 0.1.10
  - Added new configuration "gitProjectManager.checkRemoteOrigin" that allows users to
  not check remote repository origin to improve performance

### 0.1.9
  - Fixed error in dependency management in VSCode

### 0.1.8
  - Improved error messages

### 0.1.7
  - Fixed problem with VSCode configuration that changed array config default value

### 0.1.6
  - Fixed issue #2 that wasn't working on **0.1.5**

### 0.1.5
  - Added two new configs to fix issue #2 and improve perfomance that are:
    - maxDepthRecursion
    - ignoredFolders  

###0.1.4
  - Partially fixed issue #1 (special thanks to @martinpengellyphillips) with PR #3 
  that allow to configure the code application path 

##Participate

If you have any idea, feel free to create issues and pull requests.
