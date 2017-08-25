#1.4.0
  - Added compatibility with windows home path from PR #54 from [@DamonOehlman](https://github.com/DamonOehlman)
  - Fixed message related on issue #56 from [@DavidDeSloovere](https://github.com/DavidDeSloovere)

# 1.3.2
  - Fixed typo in message from PR #51 thanks to [@aaron7](https://github.com/aaron7)
  - Fixed #50 Use the Insiders config directory when running VS Code Insiders (reported by [@Tyriar](https://github.com/Tyriar))

## 1.3.1
  - Fixed #50 where MaxDepthRecursion was not working (reported by [@Tyriar](https://github.com/Tyriar))
  - Fixed #49 where the repository info was not shown (reported by [@Tyriar](https://github.com/Tyriar))

## 1.3.0
  - Implemented a new configuration to stop looking deeper, after a project is found, ignoring MaxDepthRecursion (#47)
  - Refactored GitProjectLocator and GitProjectManager classes to receive configuration via injection, making test easier.

## 1.2.1
  - Fixed the info about the shortcut keys in mac (PR #45 thanks to @kaiwood)
  - Fixed #44 where **storeRepositoriesBetweenSessions** was not working to load from cache

## 1.2.0
  - Added support to subfolders (#34)
  - Lots of refactorings to improve stability and performance

## 1.1.0
  - Closes #39 Added a new command to open a project in a new window
  - Merged #38 from @zackschuster to fix a problem where the refresh info in status bar wasn't removed

## 1.0.1
  - Fixed #36, removing the promise callback from execute command, thanks to [@Tyriar](https://github.com/Tyriar)

## 1.0.0
  - Added new command "GPM - Open Recent Git Project" that lets you open your most recent projects even faster than before

## 0.1.18
  - [#32](https://github.com/felipecaputo/git-project-manager/issues/32) - Extension was not following symlinks
  
### 0.1.17
  - Hot fix for 0.1.16, that was with a publish error

### 0.1.16
  - [#31](https://github.com/felipecaputo/git-project-manager/issues/31) - Linux tilde alinas (~) was not considered an environment variable 

### 0.1.15
  - Great contribuitions from [@Tyriar](https://github.com/Tyriar) with issues. Thanks a lot Daniel:
    - [#24](https://github.com/felipecaputo/git-project-manager/issues/24) - Restored promised QuickPick after version 0.1.14 removed it
    - [#21](https://github.com/felipecaputo/git-project-manager/issues/21) - Sorted project list
    - [#16](https://github.com/felipecaputo/git-project-manager/issues/16) - Fixed behavior that project list was keeping old repos removed from config
    - [#13](https://github.com/felipecaputo/git-project-manager/issues/13) - Parse environment variables in project folders config
    - [#11](https://github.com/felipecaputo/git-project-manager/issues/11) - Auto refresh project list after configuration changed


  - [#10](https://github.com/felipecaputo/git-project-manager/issues/10) - Auto refresh project list after configuration changed
  - [#12](https://github.com/felipecaputo/git-project-manager/issues/12) [#14](https://github.com/felipecaputo/git-project-manager/issues/14) - UX improvements


### 0.1.14
  - Temporary fix to #8 and #9, ShowQuickPick is not working when receive promises. As a side efect, quick pick will not be shown until
  all folders had been searched

### 0.1.13
  - Hotfix for 0.1.12, that was not considering **gitProjectManager.openInNewWindow** configuration

### 0.1.12
  - Now uses the new VSCode api to open folders, avoiding problems with path and configuration
  - Added configuration to define if the selected project will be opened in the same window or in a new window

### 0.1.11
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

### 0.1.4
  - Partially fixed issue #1 (special thanks to @martinpengellyphillips) with PR #3 
  that allow to configure the code application path
