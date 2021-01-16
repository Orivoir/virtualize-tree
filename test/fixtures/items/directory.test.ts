export type CategoryDirectoryFixture = "folder" | "file";

export interface DirectoryFixture {
  name: string;
  type: CategoryDirectoryFixture;
  size: number;
};

function randomName(reference: number): string {

  const names: string[] = [
    "foobar",
    "lorem ipsum",
    "foo",
    "bar",
    "fizz",
    "buzz"
  ];

  return names[Math.floor(Math.random() * names.length)] + " " + (reference).toString();
}

export function isEqual(d1: DirectoryFixture, d2: DirectoryFixture): boolean {
  return (d1.name === d2.name && d1.type === d2.type && d1.size === d2.size);
}

export default function createDirectories(times?: number | null, indexator?: number): DirectoryFixture[] {

  if(typeof times !== "number" || times === 0) {
    times = 5;
  } else {
    times = Math.round(times);
  }

  return Array.from(Array(times).keys()).map( (): DirectoryFixture => ({
    name: randomName(indexator || -1),
    type: Math.random() >= .5 ? "folder": "file",
    size: Math.floor( Math.random() * (75e5 - 1e3) ) + 1e3
  }));

}
