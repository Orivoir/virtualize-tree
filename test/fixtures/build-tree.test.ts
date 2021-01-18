import VirtualizeTree, {VirtualizeTreeProperties} from './../../src/VirtualizeTree';
import {DirectoryFixture} from './items/directory.test';
import {NodeFixture} from './items/node.test';

export type CreatorCallback<Item> = (times: number, reference: number) => Item[];

export interface BuildTreeFixtureProperties<Item> {
  isEqual: (i1: Item, i2: Item) => boolean;
  itemsByDeep: {
    min: number,
    max: number
  };
  creator: CreatorCallback<Item>;
  mute: boolean;
}

export default class BuildTreeFixture<Item = DirectoryFixture | NodeFixture> {
  private mute = false;
  private tree: VirtualizeTree<Item>;
  private isEqual: (i1: Item, i2: Item) => boolean;

  private itemsByDeep: {min: number, max: number};

  private creator: CreatorCallback<Item>;
  private randomItemsByDeep: number;


  private currentCreateItems = 0;
  private indexDeep = 0;
  private currentRoot: Item | null = null;

  constructor(properties: BuildTreeFixtureProperties<Item>) {
    this.isEqual = properties.isEqual;
    this.mute = properties.mute;

    const treeProperties: VirtualizeTreeProperties<Item> = {
      isEqual: this.isEqual
    };
    this.tree = new VirtualizeTree(treeProperties);

    this.itemsByDeep = properties.itemsByDeep;
    this.randomItemsByDeep = Math.round( Math.random() * (this.itemsByDeep.max-this.itemsByDeep.min) ) + this.itemsByDeep.min;
    this.creator = properties.creator;
  }

  private get tabString() {
    let current = "";
    Array.from(Array(this.indexDeep).keys()).map(() => current += "    ");

    return current;
  }

  private async start(onFinish: (countCreateItems: number) => void) {
    const currentRootLocal: Item | null = this.currentRoot;

    const items: Item[] = this.creator(this.randomItemsByDeep, this.indexDeep);
    let items2: Item[] = [];

    if(!this.mute) console.log("root:");

    for (let i = 0; i < this.randomItemsByDeep; i++) {
      await this.tree.add((currentRootLocal as Item), items[i]);
      this.currentCreateItems++;
      if(!this.mute) console.log(`${this.tabString}${this.indexDeep}`);

      this.indexDeep++;
      for(let j = 0; j < this.randomItemsByDeep; j++) {
        items2 = this.creator(this.randomItemsByDeep, this.indexDeep);

        await this.tree.add(items[i], items2[j]);
        this.currentCreateItems++;
        if(!this.mute) console.log(`${this.tabString}${this.indexDeep}`);

        this.indexDeep++;
        for(let k = 0; k < this.randomItemsByDeep; k++) {
          const items3 = this.creator(this.randomItemsByDeep, this.indexDeep);

          await this.tree.add(items2[j], items3[k]);
          this.currentCreateItems++;
          if(!this.mute) console.log(`${this.tabString}${this.indexDeep}`);

          this.indexDeep++;
          for(let l = 0; l < this.randomItemsByDeep; l++) {
            const items4 = this.creator(this.randomItemsByDeep, this.indexDeep);

            await this.tree.add(items3[k], items4[l]);
            this.currentCreateItems++;
            if(!this.mute) console.log(`${this.tabString}${this.indexDeep}`);
          }
          this.indexDeep--;
        }
        this.indexDeep--;
      }
      this.indexDeep--;
    }

    onFinish(this.currentCreateItems);
  }

  private prepare() {
    this.currentCreateItems = 0;
    this.indexDeep = 0;

    if(this.tree.root === null) {
      const defaultRoot: Item = this.creator(1, 0)[0];
      this.tree.registerRoot(defaultRoot);
    }

    this.currentRoot = this.tree.root;
  }


  public create(): Promise<{tree: VirtualizeTree<Item>, countItems: number}> {
    this.prepare();

    return new Promise((
      resolve
    ) => {
      this.start((countCreateItems: number) => {
        if(!this.mute) console.log("has create ", countCreateItems, " items");
        resolve({
          tree: this.tree,
          countItems: countCreateItems
        });
      });
    });
  }
}
