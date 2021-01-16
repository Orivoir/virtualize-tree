import FindItem, {FindItemProperties} from './FindItem';
import LoopTree, {LoopTreeProperties} from './LoopTree';


export interface VirtualizeTreeProperties<Item> {

  /**
   * @description verify equality between 2 items is use during find loop, most use
   * @param {Item} i1
   * @param {Item} i2
   * @returns {boolean}
   */
  isEqual: VirtualizeTreeIsEqualCallback<Item>;

  root?: Item;
}

export type VirtualizeTreeIsEqualCallback<Item> = (i1: Item, i2: Item) => boolean;

export interface VirtualizeTreeContainer<Item> {

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
}

export default class VirtualizeTree<Item> {
  private tree: VirtualizeTreeContainer<Item> | null = null;
  private isEqual: VirtualizeTreeIsEqualCallback<Item>;

  constructor(properties: VirtualizeTreeProperties<Item>) {
    if(!(properties.isEqual instanceof Function)) {
      throw new TypeError("property `isEqual: (i1: Item, i2: Item) => boolean` is missing, cant verify equality between items");
    }

    this.isEqual = properties.isEqual;

    if(typeof properties.root !== "undefined") {
      this.createRoot(properties.root);
    }
  }


  private createRoot(item: Item): void {
    this.tree = {
      childrens: null,
      deep: 0,
      parent: null,
      item
    };
  }

  private createVirtualizeContainer(item: Item, parent: VirtualizeTreeContainer<Item>): VirtualizeTreeContainer<Item> {
    return {
      childrens: null,
      deep: parent.deep + 1,
      item,
      parent
    };
  }

  private static get ERROR_MESSAGE_NOT_ROOT_EXISTS(): string {
    return "cant take operation before hydrate root tree, use method: `registerRoot: (item: Item) => void`";
  }

  public registerRoot(item: Item): void {
    if(this.tree !== null) {
      throw new TypeError("root has already been hydrate");
    }

    this.createRoot(item);
  }

  public async find(item: Item): Promise<VirtualizeTreeContainer<Item> | null> {
    if(!this.tree) {
      throw new TypeError(VirtualizeTree.ERROR_MESSAGE_NOT_ROOT_EXISTS);
    }

    return new Promise((
      resolve: (result: VirtualizeTreeContainer<Item> | null) => void
    ): void => {
      if(this.tree !== null) {
        if(this.tree) {
          if(this.isEqual(item, this.tree.item) ) {
            resolve(this.tree);
          } else {
            const findItemProperties: FindItemProperties<Item> = {
              isEqual: this.isEqual,
              item,
              resolve,
              tree: this.tree
            };

            new FindItem(findItemProperties);
          }
        }
      } else {
        resolve(null);
      }
    });
  }

  public add(parent: Item, child: Item): Promise<boolean> {
    return new Promise((resolve): void => {
      this.find(parent)
      .then((parentContainer: VirtualizeTreeContainer<Item> | null) => {
        if(!parentContainer) {
          resolve(false);
        } else {
          if(!(parentContainer.childrens instanceof Array)) {
            parentContainer.childrens = [];
          }

          parentContainer.childrens.push(
            this.createVirtualizeContainer(child, parentContainer)
          );
          resolve(true);
        }
      });
    });
  }

  /** @TODO write test remove method */
  public remove(item: Item): Promise<boolean> {
    return new Promise((resolve) => {
      this.find(item)
      .then((itemContainer: VirtualizeTreeContainer<Item> | null): void => {
        if(!itemContainer) {
          resolve(false);
        } else {
          const parentContainer: VirtualizeTreeContainer<Item> | null = itemContainer.parent;

          if(!parentContainer) {
            throw new Error(`cant remove root tree`);
          } else {
            if(!(parentContainer.childrens instanceof Array)) {
              throw new Error(`internal error "child.parent.childrens" is null`);
            } else {
              const lastSize = parentContainer.childrens.length;

              parentContainer.childrens = parentContainer.childrens.filter((child: VirtualizeTreeContainer<Item>): boolean => (
                child !== itemContainer
              ));

              const countRemove = lastSize - parentContainer.childrens.length;

              if(countRemove !== 1) {
                throw new Error(`internal error remove item has delete ${countRemove} item.s after find item success`);
              } else {
                resolve(true);
              }
            }
          }
        }
      });
    });
  }

  public get root(): Item | null {
    return this.tree ? this.tree.item: null;
  }

  public get containerRoot(): VirtualizeTreeContainer<Item> | null {
    return this.tree;
  }

  public forEach(callback: (item: VirtualizeTreeContainer<Item>) => void, onFinish?: (maxDeep: number) => void): void {
    if(!this.tree) {
      throw new TypeError(VirtualizeTree.ERROR_MESSAGE_NOT_ROOT_EXISTS);
    }

    const loopTreeProperties: LoopTreeProperties<VirtualizeTreeContainer<Item>> = {
      tree: this.tree
    };

    const looping = new LoopTree(loopTreeProperties);

    looping.start(
      (item: VirtualizeTreeContainer<Item>): boolean => {
        callback(item);
        return true;
      },
      onFinish
    );
  }

  // public createSnapshot() {


  //   if(!this.tree) {
  //     throw new TypeError(VirtualizeTree.ERROR_MESSAGE_NOT_ROOT_EXISTS);
  //   }

  //   const treeCopy: VirtualizeTreeContainer<Item> = Object.assign({}, this.tree);

  //   return new Promise(
  //     (
  //       resolve: (snapShotResult: VirtualizeTreeSnapshotResult<Item>) => void,
  //       reject
  //     ) => {

  //     const localResolve = (maxDeep: number) => {
  //       resolve({tree: treeCopy, maxDeep});
  //     };

  //     new LoopTree({
  //       tree: treeCopy,
  //       resolve: localResolve,
  //       forEach(item: VirtualizeTreeContainer<Item>): boolean {

  //         item.parent = null;

  //         // continue loop
  //         return true;
  //       }
  //     })

  //   });

  //   // return JSON.parse(JSON.stringify(this.tree), (attributeName: string, value: any) => {
  //   //   if(attributeName === "parent") {
  //   //     return null;
  //   //   } else return value;

  //   // });

  // }
}

