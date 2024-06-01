/**
 * @type {"webkit"|"firefox"|"chromium"|null}
 */
let browser = null
function isLocalStorageAvailable() {
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        if (localStorage.getItem(test) !== test) throw new Error()
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}
/**
 * Request fullscreen. can guess browser's engine based upon which sub-method works
 * @returns {Promise<void>}
 */
async function fullscreen() {
    const elem = document.documentElement
    if (elem.webkitRequestFullscreen) {
        browser = "safari"
        return await elem.webkitRequestFullscreen();
    } else if (elem.requestFullscreen) {
        try {
            browser = "chromium"
            return await elem.requestFullscreen({ navigationUI: "hide" })
        }
        catch {
            browser = "firefox"
            return elem.requestFullscreen();
        }
    } else {
        return await new Promise((_, rej) => rej("Fullscreen API is not supported in this browser"))
    }
}

/**
 * @template T
 * @param {()=>T} handler 
 * @param {number} timeout 
 * @returns {Promise<T>}
 */
async function promisifyTimeout(handler, timeout) {
    return await new Promise((resolve, _) => { setTimeout(() => { resolve(handler()) }, timeout) })
}

async function wait(ms) {
    return await promisifyTimeout(() => { }, ms)
}

/**
 * @param {string} [message]
 * @param {number} [http_code]
 * @param {string} [cf_id]
 */
function BSoD(message, http_code, cf_id) {
    const bluePage = document.getElementById('bluePage')
    document.querySelectorAll('body > div:not(#bluePage)').forEach(e => e.classList.add('hidden'))
    if (message) {
        console.error(message)
        bluePage.querySelector(':nth-child(5)').innerText = message.replaceAll(' ', '_').toUpperCase()
    }
    /**
     * @type {HTMLScriptElement}
     */
    let beacon
    if (!cf_id && (beacon = document.body.querySelector('script[data-cf-beacon]'))) cf_id = beacon.dataset.cfBeacon.slice(11, 43)
    else
        cf_id = cf_id || '00000000000000000000000000000000'
    http_code = String(http_code || 0).padStart(8, '0')
    let cf = [cf_id.slice(0, 8).padEnd(8, '0'), cf_id.slice(8, 16).padEnd(8, '0'), cf_id.slice(16, 24).padEnd(8, '0'), cf_id.slice(24, 32).padEnd(8, '0')]
    bluePage.querySelector(':nth-child(22)').innerText = `*** STOP: 0x${http_code
        .toUpperCase()} (0x${cf[0]}, 0x${cf[1]}, 0x${cf[2]}, 0x${cf[3]})`

    bluePage.classList.remove('hidden')
    localStorage.clear()
}
/**
 * @param {string[]} values
 * @returns {{readonly [P in string]: P}}
 */
function createEnum(values) {
    const enumObject = {};
    for (const val of values) {
        enumObject[val] = val;
    }
    return Object.freeze(enumObject);
}
const browserEnum = createEnum(["webkit", "firefox", "chromium"])

/**
 * Check if password is strong.
 * @param {string} password 
 * @returns {boolean}
 */
function isPasswordStrong(password) {
    if (password.length < 8) {
        windowManager.error("password must have at least 8 characters")
        return false
    }
    if (!password.match("[a-zA-Z]")) {
        windowManager.error("password must have at least 1 letter")
        return false
    }
    if (!password.match("[0-9]")) {
        windowManager.error("password must have at least 1 digit")
        return false
    }
    return true
}