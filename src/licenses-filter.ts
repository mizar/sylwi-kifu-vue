const lines: string[] = [];
const reader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

reader.on("line", (line: string) => { lines.push(line) });
reader.on("close", () => {

  const data = JSON.parse(lines.join(""));

  for (const [key, value] of Object.entries<any>(data)) {
    value.path = undefined;
  }

  console.log(JSON.stringify(data, undefined, 2));

});
