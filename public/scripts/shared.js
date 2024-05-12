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
    if (elem.requestFullscreen) {
        try {
            browser = "chromium"
            return elem.requestFullscreen({ navigationUI: "hide" })
        }
        catch {
            browser = "firefox"
            return elem.requestFullscreen();
        }
    } else if (elem.webkitRequestFullscreen) {
        browser = "safari"
        return elem.webkitRequestFullscreen();
    } else {
        return new Promise((_, rej) => rej())
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

function get() {
}