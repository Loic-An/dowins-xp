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
    if (http_code || cf_id) {
        cf_id = String(cf_id) || '0000000000000000'
        http_code = String(http_code).padStart(8, '0') || "00000000"
        let cf = [cf_id.slice(0, 8).padEnd(8, '0'), cf_id.slice(8, 16).padEnd(8, '0')]
        bluePage.querySelector(':nth-child(22)').innerText = `*** STOP: 0x${http_code
            .toUpperCase()} (0x${cf[0].toUpperCase()}, 0x${cf[1].toUpperCase()})`
    }
    bluePage.classList.remove('hidden')
    localStorage.clear()
}