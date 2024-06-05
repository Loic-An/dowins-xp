const COMMIT_VERSION = process.argv[2]
if (!COMMIT_VERSION) {
    console.error("Please provide a commit version")
    process.exit(1)
}
const fs = require('fs')
fs.writeFileSync('public/scripts/sw.js', fs.readFileSync('public/scripts/sw.js', 'utf8')
    .replace(`"current"`, `"${COMMIT_VERSION}"`))