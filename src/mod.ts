import * as LoopTreeContent from './LoopTree';
import * as VirtualizeTreeContent from './VirtualizeTree';

export namespace VirtualizeTree {

  export function create<Item>(
    properties: VirtualizeTreeContent.VirtualizeTreeProperties<Item>
  ) {
    return new VirtualizeTreeContent.default(properties);
  }

  export const LoopTree = LoopTreeContent;

};
