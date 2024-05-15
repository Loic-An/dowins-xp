const crypto = require('node:crypto');
const fs = require('node:fs');

const strong = false

if (fs.existsSync('./.dev.vars')) {
    const devVars = fs.readFileSync('./.dev.vars', 'utf8');
    const devVarsArray = devVars.split('\n');
    let exists = false;
    devVarsArray.forEach((line) => {
        if (line.startsWith('JWT_KEY=')) {
            exists = true;
            console.log('JWT_KEY already exists');
        }
    })
    if (!exists) {
        fs.appendFileSync('./.dev.vars', '\nJWT_KEY=' + crypto.randomBytes(32 * (1 + strong)).toString('hex'));
    }
} else {
    fs.writeFileSync('./.dev.vars', 'JWT_KEY=' + crypto.randomBytes(32 * (1 + strong)).toString('hex'));
}
process.exitCode = 0;