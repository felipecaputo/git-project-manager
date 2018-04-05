/* global describe, it */

const DirList = require('../src/dirList');
const expect = require('chai').expect;

describe('dirList Tests', () => {
    it('should add directories to list', () => {
        let dirList = new DirList();
        dirList.add('/home/user/path', 'path');
        expect(dirList.dirList.length).to.be.equal(1);
        dirList.add('/home/user/path2', 'path2');
        expect(dirList.dirList.length).to.be.equal(2);
    });

    it('should not add duplicates', () => {
        let dirList = new DirList();
        dirList.add('/home/user/path', 'path');
        expect(dirList.dirList.length).to.be.equal(1);
        dirList.add('/home/user/path', 'path');
        expect(dirList.dirList.length).to.be.equal(1);
    });

    it('should validate existing repositories', () => {
        let dirList = new DirList();
        dirList.add('/home/user/path', 'path');
        expect(dirList.exists('/home/user/path')).to.be.true;
    });

    it('shouldn\'t validate not existing repositories', () => {
        let dirList = new DirList();
        dirList.add('/home/user/path', 'path');
        expect(dirList.exists('/home/user/path2')).to.be.false;
    })

    it('should concatenate two dirlist', () => {
        let dirList = new DirList();
        dirList.add('/home/user/path', 'path');
        dirList.add('/home/user/path2', 'path2');

        let dirList2 = new DirList();
        dirList2.add('/home/user/path2', 'path2');
        dirList2.add('/home/user/path3', 'path3');
        dirList2.add('/home/user/path4', 'path4');

        dirList.concat(dirList2);

        expect(dirList.dirList.length).to.be.equal(4);

    })
})
