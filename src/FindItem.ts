import LoopTree, {LoopTreeProperties} from './LoopTree';
import {VirtualizeTreeContainer} from './VirtualizeTree';

export interface FindItemProperties<Item> {
  item: Item;
  tree: VirtualizeTreeContainer<Item>;
  resolve: (result: VirtualizeTreeContainer<Item> | null) => void;
  isEqual: (i1: Item, i2: Item) => boolean;
}

export default class FindItem<Item> {
  private item: Item;
  private tree: VirtualizeTreeContainer<Item>;
  private resolve: (result: VirtualizeTreeContainer<Item> | null) => void;
  private isEqual: (i1: Item, i2: Item) => boolean;
  private isAlreadyResolve = false;

  constructor(properties: FindItemProperties<Item>) {
    this.item = properties.item;
    this.tree = properties.tree;
    this.isEqual = properties.isEqual;
    this.resolve = properties.resolve;

    const loopTreeProperties: LoopTreeProperties<VirtualizeTreeContainer<Item>> = {
      tree: this.tree
    };

    new LoopTree(loopTreeProperties).start(
      (currentItem: VirtualizeTreeContainer<Item>) => {
        if( this.isEqual(currentItem.item, this.item) ) {
          this.isAlreadyResolve = true;
          this.resolve(currentItem);

          // stop loop tree
          return false;
        }

        // continue loop tree
        return true;
      },
      () => {
        // has finish loop tree
        if(!this.isAlreadyResolve) {
          // has not find item
          this.resolve(null);
        }
        // else has already call resolve from forEach
      }
    );
  }
}
