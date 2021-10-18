import Config from "./domain/config";

// @ts-check
import * as cp from 'child_process';
import * as vscode from 'vscode';
import * as walker from 'walker';
import * as path from 'path';
import { existsSync } from 'fs';
import DirList from './domain/dirList';

export default class ProjectLocator {
    dirList: DirList;
    config: Config;
    constructor(config: Config) {
        this.dirList = new DirList();
        this.config = config || new Config();
    }
    /**
     * Returns the depth of the directory path
     *
     * @param {String} s The path to be processed
     * @returns Number
     */
    getPathDepth(s: string): number {
        return s.split(path.sep).length;
    }
    isMaxDeptReached(currentDepth: number, initialDepth: number) {
        return (this.config.maxDepthRecursion > 0) && ((currentDepth - initialDepth) > this.config.maxDepthRecursion);
    }
    isFolderIgnored(folder: string) {
        return this.config.ignoredFolders.indexOf(folder) !== -1;
    }
    /**
     * Returs true if the *directory* param refers to a folder that is nested to an already found project and
     * _gitProjectManager.searchInsideProjects_ is true
     *
     * @param {string} directory
     */
    isNestedIgnoredFolder(directory: string) {
        return !this.config.searchInsideProjects && this.dirList.directories.some(dir => directory.includes(dir));
    }
    checkFolderExists(folderPath: string) {
        const exists = existsSync(folderPath);
        if (!exists && this.config.warnIfFolderNotFound) {
            vscode.window.showWarningMessage(`Directory ${folderPath} does not exists.`);
        }

        return exists;
    }
    filterDir(dir: string, depth: number) {
        if (this.isFolderIgnored(path.basename(dir))) { return false; };
        if (this.isMaxDeptReached(this.getPathDepth(dir), depth)) { return false; };
        if (this.isNestedIgnoredFolder(dir)) { return false; };

        return true;
    }
    walkDirectory(dir: string): Promise<DirList> {
        var depth = this.getPathDepth(dir);

        return new Promise((resolve, reject) => {
            try {
                walker(dir)
                    .filterDir((dir: string) => this.filterDir(dir, depth))
                    .on('dir', (absPath: string) => this.processDirectory(absPath))
                    .on('symlink', (absPath: string) => this.processDirectory(absPath))
                    .on('error', (e: string) => this.handleError(e))
                    .on('end', () => {
                        resolve(this.dirList);
                    });
            } catch (error) {
                reject(error);
            }

        });
    }
    async locateGitProjects(projectsDirList: string[]): Promise<DirList> {

        /** @type {string[]} */
        var promises: Promise<DirList>[] = [];

        projectsDirList.forEach((projectBasePath) => {
            if (!this.checkFolderExists(projectBasePath)) {
                return;
            }

            promises.push(this.walkDirectory(projectBasePath));
        });

        await Promise.all(promises);

        return this.dirList;
    };

    clearDirList() {
        this.dirList = new DirList();
    };

    extractRepoInfo(basePath: string): string | undefined {
        if (!this.config.checkRemoteOrigin) {
            return;
        }

        let originList = cp.execSync('git remote ', { cwd: basePath, encoding: 'utf8' });

        let firstOrigin = originList?.split('\n').shift()?.trim();
        if (firstOrigin === '') {
            return;
        }

        return cp.execSync(`git remote get-url ${firstOrigin}`, { cwd: basePath, encoding: 'utf8' })
            ?.split('\n')
            .shift()
            ?.trim();
    }
    processDirectory(absPath: string) {
        vscode.window.setStatusBarMessage(absPath, 600);
        if (existsSync(path.join(absPath, '.git', 'config'))) {
            this.dirList.add(absPath, this.extractRepoInfo(absPath));
        } else if (this.config.supportsMercurial && existsSync(path.join(absPath, '.hg'))) {
            this.dirList.add(absPath, undefined);
        } else if (this.config.supportsSVN && existsSync(path.join(absPath, '.svn'))) {
            this.dirList.add(absPath, undefined);
        }
    }
    handleError(err: string) {
        console.log('Error walker:', err);
    }
}