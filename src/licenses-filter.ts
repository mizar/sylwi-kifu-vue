const lines: string[] = [];
// eslint-disable-next-line @typescript-eslint/no-var-requires
const reader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

reader.on("line", (line: string) => {
  lines.push(line);
});
reader.on("close", () => {
  const data = JSON.parse(lines.join(""));

  for (const value of Object.values<{
    [key: string]: string | undefined;
  }>(data)) {
    value.path = undefined;
  }

  console.log(JSON.stringify(data, undefined, 2));
});
