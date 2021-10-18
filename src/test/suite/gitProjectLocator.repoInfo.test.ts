import ProjectLocator from '../../gitProjectLocator';
import Config from '../../domain/config';
import { mkdirSync, chmodSync, writeFileSync } from 'fs';
import * as rimraf from 'rimraf';
import { join } from 'path';
import { expect } from 'chai';
import { execSync } from 'child_process';

suite('Get repository information', () => {

    let baseFolderName = join(__dirname, 'repo-info-test');
    let gitConfigFilePath = join(baseFolderName, '.git/config');

    setup(() => {
        execSync(`mkdir -p ${baseFolderName}/.git && cp -R ${baseFolderName}/base-git/* ${baseFolderName}/.git`);

    })

    teardown(() => {
        rimraf.sync(join(baseFolderName, '.git'));
    })

    test('should get information when we have a single remote upstream', () => {

        execSync('git remote add upstream git@github.com:felipecaputo/some-other-project.git', { cwd: baseFolderName });

        const projectLocator = new ProjectLocator(new Config());
        expect(projectLocator.extractRepoInfo(baseFolderName)).to.equals('git@github.com:felipecaputo/some-other-project.git');

    })

    test('should get information when we have a single remote origin', () => {

        execSync('git remote add origin git@github.com:felipecaputo/git-project-manager-123.git', { cwd: baseFolderName });

        const projectLocator = new ProjectLocator(new Config());
        expect(projectLocator.extractRepoInfo(baseFolderName)).to.equals('git@github.com:felipecaputo/git-project-manager-123.git');

    })

    test('should get information when we have more than one remote', () => {

        execSync('git remote add origin git@github.com:felipecaputo/git-project-manager-123.git', { cwd: baseFolderName });
        execSync('git remote add upstream git@github.com:felipecaputo/some-other-project.git', { cwd: baseFolderName });

        const projectLocator = new ProjectLocator(new Config());
        expect(projectLocator.extractRepoInfo(baseFolderName)).to.equals('git@github.com:felipecaputo/git-project-manager-123.git');

    })

    test('should return empty on no remote', () => {
        const projectLocator = new ProjectLocator(new Config());
        expect(projectLocator.extractRepoInfo(baseFolderName)).to.equals(undefined);

    })
})