export interface TreeContainerIterable<ContainerItem> {
  childrens: ContainerItem[] | null;
  parent: ContainerItem | null;
  deep: number;
};

export interface LoopTreeProperties<ContainerItem> {
  tree: ContainerItem;
  forEach(item: ContainerItem): boolean;
  resolve(maxDeep: number): void;
};

export default class LoopTree<ContainerItem extends TreeContainerIterable<ContainerItem>> {

  private tree: ContainerItem;
  private resolve: (maxDeep: number) => void;
  private forEach: (item: ContainerItem) => boolean;
  private maxDeep: number = 0;
  private isManualStop: boolean = false;


  private currentBranch: Array<ContainerItem[]> | null = null;

  private currentBranchAsyncIterator: ContainerItem[] | null = null;
  private nextIndexAsyncIterator: number = 0;
  private currentIndexAsyncIterator: number = 0;
  private nextContainerItemAsyncIterator: ContainerItem | null = null;

  constructor(properties: LoopTreeProperties<ContainerItem>) {
    this.tree = properties.tree;
    this.resolve = properties.resolve;
    this.forEach = properties.forEach;
  }


  private prepare(): boolean {

    this.isManualStop = false;
    this.maxDeep = 0;
    this.currentBranch = null;

    this.forEach(this.tree);

    if(this.tree.childrens === null) {
      // tree is empty
      this.resolve(this.maxDeep);

      return false;
    } else {

      this.currentBranch = [this.tree.childrens];
      return true;
    }

  }

  private loop() {

    /*
    asynchrone loop of current steps tree:

    currentBranch: [ [item, item, ...] ] ([...root.childrens])

      Promise.all:
        | [item, item, ...] -> this#loopChildrens->forEach(item)

    currentBranch: [ [...item.childrens], [...item.childrens] ]

      Promise.all:
        | [item, item, ...] -> this#loopChildrens->forEach(item)
        | [item, item, ...] -> this#loopChildrens->forEach(item)

    ...
    */

    Promise.all(
      (this.currentBranch as Array<ContainerItem[]>)
      .map((childrens: ContainerItem[]): Promise<void> => (
        this.loopChildrens(childrens)
      ))
    )
    .then((): void => {

      if(this.isManualStop) {

        // last this.forEach has return false, stop loop
        this.resolve(this.maxDeep);

      } else {

        const nextBranch: Array<ContainerItem[]> = [];

        this.currentBranch?.forEach((childrens: ContainerItem[]): void => {

          childrens.forEach((child: ContainerItem): void => {

            if(child.childrens instanceof Array) {
              nextBranch.push(child.childrens);
            }
            // if child.childrens is null
            // child branch is finish
          })

        });

        this.currentBranch = nextBranch;

        if(this.currentBranch.length === 0) {
          // loop tree is finish
          this.currentBranch = null;
          this.resolve(this.maxDeep);
        } else {
          // go next branch
          this.loop();
        }
      }

    });

  }

  private async loopChildrens(childrens: ContainerItem[]): Promise<void> {

    return new Promise((resolve,reject) => {

      childrens.forEach((children: ContainerItem): void => {

        if(children.deep > this.maxDeep) {
          this.maxDeep = children.deep;
        }

        const shouldContinueLoop: boolean = this.forEach(children);

        if(!shouldContinueLoop) {
          this.isManualStop = true;
          resolve();
        }
      });

      resolve();

    });

  }

  private loopChildrensAsyncIterator(childrens: ContainerItem[]): void {

    for (const child of childrens) {

      if(this.currentIndexAsyncIterator++ === this.nextIndexAsyncIterator) {
        this.nextContainerItemAsyncIterator = child;
        this.nextIndexAsyncIterator = this.currentIndexAsyncIterator;
        break;
      }
      else continue;
    }

  }

  private loopAsyncIterator() {

    this.loopChildrensAsyncIterator((this.currentBranchAsyncIterator as ContainerItem[]));

    if(this.nextContainerItemAsyncIterator) {
      return;
    } else {

      const nextCurrentBranchAsyncIterator: ContainerItem[] = [];

      this.currentBranchAsyncIterator?.forEach((child: ContainerItem) => {

        if(child.childrens) {
          nextCurrentBranchAsyncIterator.push(...child.childrens);
        }
        // else child branch is finish

      });

      this.currentBranchAsyncIterator = nextCurrentBranchAsyncIterator;

      if( this.currentBranchAsyncIterator.length > 0 ) {

        // go next steps
        this.loopAsyncIterator();
      } else {
        // all branches is finish loop tree is finish
        return;
      }
    }
  }

  public start() {

    const isAccepted: boolean = this.prepare();

    if(isAccepted) {
      this.loop();
    } else {
      // the tree is a empty root
      // prepare method has already call resolve method
      return;
    }
  }

  [Symbol.asyncIterator]() {

    return {

      next: () => {

        if(!this.tree.childrens) return Promise.resolve({ value: this.tree, done: true });
        else {

          this.currentIndexAsyncIterator = 0;

          this.currentBranchAsyncIterator = this.tree.childrens;
          this.nextContainerItemAsyncIterator = null;

          this.loopAsyncIterator();

          if(this.nextContainerItemAsyncIterator) {

            return Promise.resolve({value: this.nextContainerItemAsyncIterator, done: false});

          } else {

            this.currentBranchAsyncIterator = null;
            this.nextContainerItemAsyncIterator = null;
            this.currentIndexAsyncIterator = 0;
            this.nextIndexAsyncIterator = 0;

            return Promise.resolve({value: this.tree, done: true});
          }

        }

      }
    }
  }


};
