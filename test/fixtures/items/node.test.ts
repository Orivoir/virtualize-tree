export type NodeCategoryFixture = "block" | "inline";

export interface NodeFixture {

  id: string;
  name: string;
  value: string;
  type: NodeCategoryFixture
}


function randomName(): string {
  const names: string[] = [
    "foobar",
    "lorem ipsum",
    "foo",
    "bar",
    "fizz",
    "buzz"
  ];

  return names[Math.floor(Math.random() * names.length)];
}

const createRandomId = () => {
  return `${Date.now() / Math.random()}${Math.random()}`;
};

export function isEqual(n1: NodeFixture, n2: NodeFixture): boolean {
  return n1.id === n2.id;
}

export default function createDirectories(times?: number | null): NodeFixture[] {
  if(typeof times !== "number" || times === 0) {
    times = 5;
  } else {
    times = Math.round(times);
  }

  return Array.from(Array(times).keys()).map( (): NodeFixture => ({
    name: randomName(),
    type: Math.random() >= .5 ? "block": "inline",
    id: createRandomId(),
    value: `${randomName()}${createRandomId()}`
  }));
}
