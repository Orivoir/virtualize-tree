import {assert, expect} from 'chai';

import createNodes, {NodeFixture, isEqual as isEqualNodes} from './fixtures/items/node.test';

import BuildTreeFixture, {BuildTreeFixtureProperties} from './fixtures/build-tree.test';
import VirtualizeTree from '../src/VirtualizeTree';

describe('build tree fixtures', () => {

  it('should build tree deep 4 with 2 item by deep level', () => {

    const buildTreeFixtureProperties: BuildTreeFixtureProperties<NodeFixture> = {
      creator: createNodes,
      itemsByDeep: {
        min: 2,
        max: 2
      },
      isEqual: isEqualNodes,
      mute: true
    };

    const buildTreeFixture = new BuildTreeFixture(buildTreeFixtureProperties);

    return buildTreeFixture.create()
    .then((result: {tree: VirtualizeTree<NodeFixture>}): void => {

      const {tree} = result;

      assert.isObject(tree);

      assert.isArray(tree.containerRoot?.childrens);
      expect(tree.containerRoot?.childrens).to.have.lengthOf(2);

      const childs = tree.containerRoot?.childrens;

      if(!(childs instanceof Array)) {
        throw new TypeError('child deep 1 is empty');
      }

      childs.forEach(child => {

        assert.isObject(child);
        assert.isArray(child.childrens);
        expect(child.childrens).to.have.lengthOf(2);

      });

    });

  } );

});