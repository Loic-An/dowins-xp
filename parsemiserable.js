const fs = require('node:fs')

/**
 * @type {{[key:string]:string[]}}
 */
var words = {}
const miserable = fs.readFileSync("lesmiserables.txt", "utf8")
const [getWordFile1, getWordFile2] = fs.readFileSync("functions/api/_shared.js", "utf8").split('{}')
miserable.split(/[(\r?\n),. ]/).map((v) => v.normalize('NFD').replace(/\p{Diacritic}/gu, ""))
    .filter((v) => /^[a-z]+$/.test(v)).forEach((v) => {
        if (!words[v.length]) words[v.length] = []
        if (!words[v.length].includes(v)) words[v.length].push(v)
    })
fs.writeFileSync("functions/api/_shared.js", getWordFile1 + JSON.stringify(words) + getWordFile2)