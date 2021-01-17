import BuildTreeFixture, {BuildTreeFixtureProperties} from './fixtures/build-tree.test';
import VirtualizeTree, {VirtualizeTreeContainer} from '../src/VirtualizeTree';

import createDirectoriesFixture, {isEqual as isEqualDirectory, DirectoryFixture} from './fixtures/items/directory.test';
import {assert, expect} from 'chai';

// test crud action VirtualizeTree
describe('./src/VirtualizeTree.ts', () => {
  let tree: VirtualizeTree<DirectoryFixture> | null = null;

  beforeEach(() => {
    return new Promise((resolve, reject) => {
      const buildTreeFixtureProperties: BuildTreeFixtureProperties<DirectoryFixture> = {
        creator: createDirectoriesFixture,
        isEqual: isEqualDirectory,
        itemsByDeep: {
          min: 3,
          max: 3
        },
        mute: true
      };

      const buildTreeFixture = new BuildTreeFixture(buildTreeFixtureProperties);

      buildTreeFixture.create()
      .then((result: {tree: VirtualizeTree<DirectoryFixture>}): void => {
        tree = result.tree;
        resolve(null);
      })
      .catch(error => reject(error));
    });
  });

  it('should add item into tree', async () => {
    if(tree === null) {
      throw new TypeError('tree has not been create');
    }

    const item: DirectoryFixture = {
      name: "not already exists",
      size: -1,
      type: "folder"
    };

    let wrapItem: VirtualizeTreeContainer<DirectoryFixture> | null = await tree.find(item);

    expect(wrapItem).to.be.equal(null);

    const hasAppend: boolean = await tree.add((tree.root as DirectoryFixture), item);

    expect(hasAppend).to.be.equal(true);

    wrapItem = await tree.find(item);

    assert.isObject(wrapItem);

    const naturalItem: DirectoryFixture | null = wrapItem?.item || null;

    if(naturalItem === null) {
      throw new TypeError('item add not contains original data');
    }

    expect(naturalItem).to.be.equal(item);

    return 0;
  });

  it('should remove item into tree', async () => {
    if(tree === null || tree.containerRoot === null || tree.containerRoot.childrens === null) {
      throw new TypeError('tree has not been create');
    }

    const child: VirtualizeTreeContainer<DirectoryFixture> = tree.containerRoot.childrens[0];

    const hasRemove: boolean = await tree.remove(child.item);

    assert.isTrue(hasRemove);

    const childFind: VirtualizeTreeContainer<DirectoryFixture> | null = await tree.find(child.item);
    expect(childFind).to.be.equal(null);
  } );
});
