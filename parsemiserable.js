const fs = require('node:fs')

var words = {}
const miserable = fs.readFileSync("lesmiserables.txt", "utf8")
const [getWordFile1, getWordFile2] = fs.readFileSync("functions/api/getWord.js", "utf8").split('{}')
miserable.split(/[(\r?\n),. ]/).map((v) => v.normalize('NFD').replace(/\p{Diacritic}/gu, ""))
    .filter((v) => !/[A-Z']|[^a-zA-Z\s]/.test(v)).forEach((v) => {
        if (!words[v.length]) words[v.length] = []
        if (words[v.length].indexOf(v) === -1) words[v.length].push(v.toUpperCase())
    })
fs.writeFileSync("functions/api/getWord.js", getWordFile1 + JSON.stringify(words) + getWordFile2)