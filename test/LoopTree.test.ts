import VirtualizeTree, {VirtualizeTreeProperties, VirtualizeTreeContainer} from './../src/VirtualizeTree';
import LoopTree, {LoopTreeProperties} from './../src/LoopTree';
import BuildTree, {BuildTreeFixtureProperties} from './fixtures/build-tree.test';

import createNodeFixtures, {isEqual as isEqualNodes,NodeFixture} from './fixtures/items/node.test';

import {expect} from 'chai';

describe('./src/LoopTree.ts', () => {

  it('should loop tree deep 4 with 2 item by deep level with for...await', () => {

    const buildTreeFixtureProperties: BuildTreeFixtureProperties<NodeFixture> = {
      creator: createNodeFixtures,
      isEqual: isEqualNodes,
      itemsByDeep: {
        min: 2,
        max: 2
      },
      mute: true
    };

    const buildTreeFixture = new BuildTree(buildTreeFixtureProperties);

    return buildTreeFixture.create()
    .then(async (result: {tree: VirtualizeTree<NodeFixture>, countItems: number}): Promise<void> => {

      if(result.tree.containerRoot === null) {
        throw new TypeError('root tree is null');
      }

      const loopTreeProperties: LoopTreeProperties<VirtualizeTreeContainer<NodeFixture>> = {
        tree: result.tree.containerRoot
      };

      const looper = new LoopTree(loopTreeProperties);

      let itemFind = 0;

      for await(const node of looper) {
        itemFind++;
      }

      expect(itemFind).to.be.equal(result.countItems);


    })
    .catch(error => {
      throw new Error(error);
    })

  });

  it('should loop tree deep 4 with 3 item by deep level with callback system', () => {

    const buildTreeFixtureProperties: BuildTreeFixtureProperties<NodeFixture> = {
      creator: createNodeFixtures,
      isEqual: isEqualNodes,
      itemsByDeep: {
        min: 3,
        max: 3
      },
      mute: true
    };

    const buildTreeFixture = new BuildTree(buildTreeFixtureProperties);

    return buildTreeFixture.create()
    .then(async (result: {tree: VirtualizeTree<NodeFixture>, countItems: number}) => {

      if(result.tree.containerRoot === null) {
        throw new TypeError('root tree is null');
      }

      const loopTreeProperties: LoopTreeProperties<VirtualizeTreeContainer<NodeFixture>> = {
        tree: result.tree.containerRoot
      };

      const looper = new LoopTree(loopTreeProperties);

      let directoryFind = 0;

      return new Promise((resolve, reject: (reason: any) => void) => {

        looper.start(
          (node: VirtualizeTreeContainer<NodeFixture>): boolean => {

            directoryFind++;
            // continue loop
            return true;
          },
          (maxDeep: number) => {
            if(directoryFind !== result.countItems) {
              reject(new Error(`has not find all items should: ${directoryFind}, has: ${result.countItems}`));
            }
            if(maxDeep !== 4) {
              reject(new Error(`max deep find should be 4 and have find ${maxDeep}`));
            }

            resolve(null);
          }
        );

      })
      .catch(error => {
        throw new Error(error);
      })

    })

  } );

} );
