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

  it('should update item into tree', async () => {
    if(tree === null || tree.containerRoot === null || tree.containerRoot.childrens === null) {
      throw new TypeError('tree has not been create');
    }

    const child: VirtualizeTreeContainer<DirectoryFixture> = tree.containerRoot.childrens[0];

    if(child === null) {
      throw new TypeError('tree has not been hydrate');
    }

    const newChild: DirectoryFixture = {
      name: "new child name",
      size: -1,
      type: "folder"
    };

    const copyLastItem = Object.assign({}, child.item);

    const hasBeenChange: boolean = await tree.update(child.item, newChild);
    expect(hasBeenChange).to.be.equal(true);

    // cant use find last item with: child.item because child.item has been update by ref object
    const findLastItem: VirtualizeTreeContainer<DirectoryFixture> | null = await tree.find(copyLastItem);
    expect(findLastItem).to.be.equal(null);

    const findNewItem: VirtualizeTreeContainer<DirectoryFixture> | null = await tree.find(newChild);
    expect(findNewItem).to.be.not.equal(null);
    expect(findNewItem?.item).to.be.equal(newChild);
  });
});
