export const assign: <T>(target: T, source: Partial<T>) => T = Object.assign;
export const assign2: <T>(
  target: T,
  source1: Partial<T>,
  source2: Partial<T>
) => T = Object.assign;
export const assign3: <T>(
  target: T,
  source1: Partial<T>,
  source2: Partial<T>,
  source3: Partial<T>
) => T = Object.assign;
export const passign: <T>(
  target: Partial<T>,
  source: Partial<T>
) => Partial<T> = Object.assign;
