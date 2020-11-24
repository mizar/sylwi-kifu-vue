declare module "mtrand" {
  export default function (
    seed: number,
    upper_bound?: number
  ): IterableIterator<number>;
}
