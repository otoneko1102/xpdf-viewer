const fs = require("fs-extra");
const path = require("path");

const pkg = fs.readJsonSync(path.join(__dirname, "../package.json"));
const name = pkg.name;
const version = pkg.version;

let README = fs.readFileSync(path.join(__dirname, "./README.md"), "utf-8");
README = README.replace(/%name%/g, name).replace(/%version%/g, version);

fs.writeFileSync(path.join(__dirname, "../README.md"), README, "utf-8");

console.log(`README.md updated to version ${version}!`);
