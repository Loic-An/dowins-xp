const fs = require('node:fs')

/**
 * @type {{[key:string]:string[]}}
 */
var words = {}

if (fs.existsSync("functions/api/_words.js")) {
    return
}
const miserable = fs.readFileSync("lesmiserables.txt", "utf8")
miserable.split(/[(\r?\n),. ]/).map((v) => v.normalize('NFD').replace(/\p{Diacritic}/gu, ""))
    .filter((v) => /^[a-z]+$/.test(v)).forEach((v) => {
        if (!words[v.length]) words[v.length] = []
        if (!words[v.length].includes(v)) words[v.length].push(v)
    })
fs.writeFileSync("functions/api/_words.js", "/**\n * run \`npm build\` to populate the constant\n * @type {{[key:number]:string[]}}\n */\nexport const words = " + JSON.stringify(words))