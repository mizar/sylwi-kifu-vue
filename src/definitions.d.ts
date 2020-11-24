declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.gif" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.ttf" {
  const value: string;
  export default value;
}

declare module "*.otf" {
  const value: string;
  export default value;
}

interface ClipboardItem {
  readonly lastModified: number;
  readonly delayed: boolean;
  readonly types: ReadonlyArray<string>;
  getType(type: string): Promise<Blob>;
}

declare let ClipboardItem: {
  prototype: ClipboardItem;
  new (items: { [type: string]: Promise<string | Blob> | Blob }): ClipboardItem;
};

interface Clipboard {
  read(): Promise<ClipboardItem[]>;
  readText(): Promise<string>;
  write(data: ClipboardItem[] | DataTransfer): Promise<void>;
  writeText(data: string): Promise<void>;
}
