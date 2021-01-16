# [virtualize-tree](https://github.com/orivoir/virtualize-tree)

## Generic manager of tree data.

Virtualize tree data for of directories, nodes or any other data type this library can work with nodejs and browser.

- [installation](#installation)
- [basic usage](#basic-usage)
- [add root tree](#add-root-tree)
- [add item into tree](#add-item-into-tree)
- [find item](#find-item)
- [loop tree](#loop-tree)

### installation

```bash
npm i --save virtualize-tree
```

### basic usage


#### Typescript
```ts
import VirtualizeTree, {VirtualizeTreeProperties} from 'virtualize-tree';

interface Directory {
  name: string;
  size: number;
}

const propertiesVirtualizeTree: VirtualizeTreeProperties<Directory> = {

  isEqual: function(directory1: Directory, directory2: Directory): boolean {
    return (directory1.name === directory2.name && directory1.size === directory2.size);
  }

};

const directoryTree = new VirtualizeTree(propertiesVirtualizeTree);
```

#### JavaScript
```js
import VirtualizeTree from 'virtualize-tree';

const propertiesVirtualizeTree = {

  isEqual: function(directory1, directory2) {
    return (directory1.name === directory2.name && directory1.size === directory2.size);
  }

};

const directoryTree = new VirtualizeTree(propertiesVirtualizeTree);
```

#### Javascript (CommonJS)
```js
const VirtualizeTree = require('virtualize-tree');

const propertiesVirtualizeTree = {

  isEqual: function(directory1, directory2) {
    return (directory1.name === directory2.name && directory1.size === directory2.size);
  }

};

const directoryTree = new VirtualizeTree(propertiesVirtualizeTree);
```

### add root tree

```ts

const directoryRoot: Directory = {
  name: "foobar",
  size: 1024
};

directoryTree.registerRoot(directoryRoot);

```

### add item into tree

```ts

const firstDirectory: Directory = {
  name: "docs",
  size: 512
};

directoryTree.add(directoryRoot, firstDirectory)
.then((hasBeenAdded: boolean): void => {

  if(hasBeenAdded) {
    console.log(`${child.name} directory has been added into ${directoryRoot.name} directory`);
  } else {
    console.error(`oops, ${directoryRoot.name} not exists into tree`);
  }

});
```

# find item

the Virtualize tree use a wrap for add the items into tree during a find item or during a loop of tree, you receive the wrap of item that is a `VirtualizeTreeContainer`

```ts
interface VirtualizeTreeContainer<Item> {

  /**
   * @var {Item} item - ref to natural item
   */
  item: Item;

  /**
   * @var {number} deep - deep level this item, root is `0`
   */
  deep: number;

  /**
   * @var {Item} parent - ref to parent **container item** only root is `null`
   */
  parent: VirtualizeTreeContainer<Item> | null;

  /**
   * @var {VirtualizeTreeContainer<Item>[] | null} childrens - list of childrens **container items** for this item
   */
  childrens: VirtualizeTreeContainer<Item>[] | null;

};
```

```ts

const directoryToSearch = {
  name: "docs",
  size: 512
};

directoryTree.find(directoryToSearch)
.then((wrapDirectoryFind: Promise<VirtualizeTreeContainer<Directory>> | null): void => {

  if(wrapDirectoryFind) {

    // wrapDirectoryFind.parent is null as long as wrapDirectoryFind is tree root
    console.log(`${wrapDirectoryFind.item.name} has been find to deep level ${wrapDirectoryFind.deep}, has ${wrapDirectoryFind.parent?.item.name} as parent directory`)

  } else {

    console.log(`${directoryToSearch} is not into tree`);
  }

});

```

## loop tree

VirtualizeTree provide a generic class for loop a tree (`LoopTree`) that implement [Symbol.asyncIterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) method, from `async function` you can use `for...await` loop with instance of `LoopTree`

```ts

import LoopTree, {LoopTreeProperties} from 'virtualize-tree/LoopTree';


const loopTreeProperties: LoopTreeProperties<VirtualizeTreeContainer<DirectoryFixture>> = {
  tree: directoryTree.containerRoot
};

const looper = new LoopTree(loopTreeProperties);

(async () => {

  for(const wrapDirectory of looper) {

    // wrapDirectory: VirtualizeTreeContainer<DirectoryFixture>
    console.log(wrapDirectory);
  }

})();

```
