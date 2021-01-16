import VirtualizeTree, {VirtualizeTreeProperties, VirtualizeTreeContainer} from './../src/VirtualizeTree';

import createFactoryNode, {isEqual as isEqualNode} from './fixtures/items/node.test';
import createFactoryDirectory, {isEqual as isEqualDirectory, DirectoryFixture} from './fixtures/items/directory.test';
import { assert, expect } from 'chai';

describe('./src/VirtualizeTree.ts', () => {

  describe('build tree with factory directories:', () => {

    const propertiesVirtualizeTree: VirtualizeTreeProperties<DirectoryFixture> = {
      isEqual: isEqualDirectory
    };

    let directoryTree = new VirtualizeTree(propertiesVirtualizeTree);

    const directoriesDeep1: DirectoryFixture[] = createFactoryDirectory(3, 1);
    const directoriesDeep2: DirectoryFixture[] = createFactoryDirectory(3, 2);
    const directoriesDeep3: DirectoryFixture[] = createFactoryDirectory(3, 3);
    const directoriesDeep4: DirectoryFixture[] = createFactoryDirectory(3, 4);
    const directoriesNotAppend: DirectoryFixture[] = createFactoryDirectory(3, -1);

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

      messageIt = `should find item deep ${(index + 1)}`;
      it(messageIt, () => {

        return Promise.all(
          directoriesDeep.map((directoryDeep: DirectoryFixture): Promise<VirtualizeTreeContainer<DirectoryFixture> | null> => (
            directoryTree.find(directoryDeep)
          ))
        )
        .then((responses: Array<VirtualizeTreeContainer<DirectoryFixture> | null> | undefined): void => {

          responses?.forEach((response: VirtualizeTreeContainer<DirectoryFixture> | null, index: number): void => {
            expect(response).to.be.not.null;
            expect(response?.item).to.be.equal(directoriesDeep[index]);
          });

        })

      });

      messageIt = `should not find item deep ${(index + 1)}`;
      it(messageIt, () => {
        return Promise.all(
          directoriesNotAppend.map((directoryDeep: DirectoryFixture): Promise<VirtualizeTreeContainer<DirectoryFixture> | null> => (
            directoryTree.find(directoryDeep)
          ))
        )
        .then((responses: Array<VirtualizeTreeContainer<DirectoryFixture> | null> | undefined): void => {

          responses?.forEach((response: VirtualizeTreeContainer<DirectoryFixture> | null, index: number): void => {
            expect(response).to.be.null;
            expect(response?.item).to.be.not.equal(directoriesDeep[index]);
          });

        })

      });

    });


    it.skip('should create snapshot tree', () => {

      // directoryTree.createSnapshot()
      // .then((snapshot: VirtualizeTreeSnapshotResult<DirectoryFixture>): void => {

      //   fs.writeFileSync( path.join(__dirname,`./snapshot/${Date.now()}.json`), JSON.stringify(snapshot), {encoding: "utf-8"} );
      // });

    } );
  } );

});
