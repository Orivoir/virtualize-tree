import VirtualizeTree, {VirtualizeTreeProperties, VirtualizeTreeContainer} from './../src/VirtualizeTree';
import LoopTree, {LoopTreeProperties} from './../src/LoopTree';

import createFactoryDirectory, {isEqual as isEqualDirectory, DirectoryFixture} from './fixtures/items/directory.test';
import { assert, expect } from 'chai';

describe('./src/LoopTree.ts', () => {

  const propertiesVirtualizeTree: VirtualizeTreeProperties<DirectoryFixture> = {
    isEqual: isEqualDirectory
  };

  let directoryTree = new VirtualizeTree(propertiesVirtualizeTree);

  const directoriesDeep1: DirectoryFixture[] = createFactoryDirectory(3, 1);
  const directoriesDeep2: DirectoryFixture[] = createFactoryDirectory(3, 2);
  const directoriesDeep3: DirectoryFixture[] = createFactoryDirectory(3, 3);
  const directoriesDeep4: DirectoryFixture[] = createFactoryDirectory(3, 4);

  const rootDirectory: DirectoryFixture = createFactoryDirectory(1, 0)[0];

  it('should hydrate tree root', () => {
    if(!directoryTree.root) {
      directoryTree.registerRoot(rootDirectory);
    }
    expect(rootDirectory).to.be.equal(directoryTree.root);
  });

  let currentRootToAdd = rootDirectory;

  [
    directoriesDeep1,
    directoriesDeep2,
    directoriesDeep3,
    directoriesDeep4
  ]
  .forEach((directoriesDeep: DirectoryFixture[], index: number): void => {

    let messageIt = `should add directories deep ${(index+1)}`;
    it(messageIt, () => {

      return Promise.all(
        directoriesDeep.map((directoryDeep: DirectoryFixture): Promise<boolean> => (
          directoryTree.add(currentRootToAdd, directoryDeep)
        ))
      ).then((responses: boolean[]): void => {

        responses.forEach((response: boolean) => (
          assert.isTrue(response)
        ));
        currentRootToAdd = directoriesDeep[ Math.floor(Math.random() * directoriesDeep.length) ];
      });

    });

    it('should loop with Symbol.asyncIterator (for...await)', () => {

      if(!directoryTree.containerRoot) {
        throw TypeError('root tree is not hydrate');
      }

      const loopTreeProperties: LoopTreeProperties<VirtualizeTreeContainer<DirectoryFixture>> = {
        tree: directoryTree.containerRoot,
      };

      const looping = new LoopTree(loopTreeProperties);

      (async () => {

        const startAt = Date.now();

        for await(const wrap of looping) {

          assert.isObject(wrap);
          assert.isObject(wrap.item);
          assert.isNumber(wrap.deep);

          assert.isString(wrap.item.name);
          assert.isString(wrap.item.type);
          assert.isNumber(wrap.item.size);

        }

        console.log(`> tree loop in ${Date.now()-startAt}ms tree deep ${index+1} (${directoriesDeep.length * (index+1)} items)`);

      })();

    });


  });


} );
