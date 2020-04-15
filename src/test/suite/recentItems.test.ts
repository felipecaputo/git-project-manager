/* eslint-env node, mocha */

import RecentItems from '../../recentItems';
import { expect } from 'chai';
import { useFakeTimers } from 'sinon';

import StateMock from './stateMock';

function addProjectsToList(recentList: RecentItems, size: number) {
    switch (size) {
        case 6:
            recentList.addProject('f', 'g');
        case 5:
            recentList.addProject('e', 'f');
        case 4:
            recentList.addProject('d', 'e');
        case 3:
            recentList.addProject('c', 'd');
        case 2:
            recentList.addProject('b', 'c');
        case 1:
            recentList.addProject('a', 'b');
    }
}

suite('RecentItems', () => {
    let recentItems: RecentItems;

    setup(() => {
        recentItems = new RecentItems(new StateMock());
    });

    test('should start with an empty list', () => {
        expect(recentItems.list.length).to.be.equals(0);
    });

    test('should add projects to list', () => {
        addProjectsToList(recentItems, 2);
        expect(recentItems.list.length).to.be.equals(2);
    });

    test('should load projects on create', () => {
        addProjectsToList(recentItems, 2);
        const secondInstance = new RecentItems(recentItems.state);
        expect(secondInstance.list.length).to.be.equals(2);
    });

    test('should not add the same project twice', () => {
        addProjectsToList(recentItems, 2);
        expect(recentItems.list.length).to.be.equals(2);
        recentItems.addProject('a', 'b');
        expect(recentItems.list.length).to.be.equals(2);
    });

    test('should be orderer by project added time', () => {
        let clock = useFakeTimers();
        try {
            recentItems.addProject('first', '1');

            clock.tick(1000);
            recentItems.addProject('second', '2');

            clock.tick(1000);
            recentItems.addProject('third', '3');
            expect(recentItems.list[0].projectPath).to.be.equals('third');

            clock.tick(1000);
            recentItems.addProject('first', '1');
            expect(recentItems.list[0].projectPath).to.be.equals('first');
        } finally {
            clock.restore();
        }


    });

    test('should not add more projects than limit', () => {
        recentItems.listSize = 3;
        addProjectsToList(recentItems, 6);
        addProjectsToList(recentItems, 3);
    });
});