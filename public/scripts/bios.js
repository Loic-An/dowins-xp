async function biosSequence() {
    document.querySelector("#bootPage button").classList.add("hidden")
    await fullscreen().catch((e) => console.log(e))
    const biosLoading = document.getElementById('biosLoading')
    const biosContainer = document.getElementById("biosContainer")
    let animation = setInterval(loadingAnimator, 100)
    biosContainer.classList.remove("hidden")
    await wait(700)
    document.getElementById("biosLogo").classList.remove('hidden')
    const ps = document.querySelectorAll("#biosContainer p")
    console.log(ps[0].innerText.length)
    ps[0].classList.remove('hidden')
    await wait(100)
    document.getElementById("energy").classList.remove("hidden")
    ps[1].classList.remove('hidden')
    await wait(500)
    ps[2].classList.remove('hidden')
    await wait(100)
    ps[3].classList.remove('hidden')
    await wait(400)
    await memoryChecker()
    ps[4].classList.remove('hidden')
    await wait(2000)
    clearInterval(animation)
    biosLoading.innerText = '[!]'
    await SMARTError(ps, true)
    let fun = () => SMARTError(ps)
    window.addEventListener('resize', fun);
    await wait(1000)
    animation = setInterval(loadingAnimator, 100)
    ps[11].classList.remove('hidden')
    await wait(50)
    ps[12].classList.remove('hidden')
    await wait(2000)
    let [n1, n2, n3] = [Math.round(Math.random() * 254), Math.round(Math.random() * 254), Math.round(Math.random() * 253 + 1)]
    ps[13].innerText += "" + n1 + "." + n2 + "." + n3
    ps[13].classList.remove('hidden')
    await wait(2000)
    document.querySelectorAll("#biosContainer > :not(#biosLoading)").forEach((v) => v.classList.add('hidden'))
    biosLoading.style.gridRow = 1
    window.removeEventListener('resize', fun)
    //delete fun
    await wait(1000)
    biosContainer.classList.add("hidden")
    clearInterval(animation)
    document.getElementById("bootScreen").classList.remove("hidden")
    await wait(3000)
    const bootBarElem = document.querySelectorAll('#bootBar > *')
    let i = 0
    document.getElementById('bootBar').classList.remove('hidden')
    animation = setInterval(() => {
        if (i > 2)
            bootBarElem[i - 3].classList.remove('bootBarFill')
        if (i < bootBarElem.length)
            bootBarElem[i].classList.add('bootBarFill')
        i++
        if (i > bootBarElem.length + 2)
            i = 0
        console.log(i)
    }, 300)
    await wait(10000)
    clearInterval(animation)
    document.getElementById('bootScreen').classList.add('hidden')
    isLocalStorageAvailable() && localStorage.setItem('hasBooted', "1")
    startWindows()
}

async function memoryChecker() {
    return new Promise((resolve, _) => {
        const memElem = document.getElementById("memorychecked")
        let current = 0
        let mem = setInterval(() => {
            current = parseInt(memElem.innerText.substring(16)) + Math.round(Math.random() * 4096)
            memElem.innerText = "Memory Testing :"
            if (current > 524287) {
                memElem.innerText += " 524288K OK - DDR400 CL2"
                clearInterval(mem)
                resolve()
            } else {
                memElem.innerText += " " + current.toString().padStart(6, "0") + "K"
            }
        }, 10)
    })
}
/**
 * 
 * @param {NodeListOf<HTMLParagraphElement>} plist 
 * @param {number} length
 */
async function SMARTError(plist, arewewaiting = false) {
    var width = Math.max(window.innerWidth, 1360)
    var vmin = Math.min(width, window.innerHeight) / 100
    var length = Math.round((width / 100) / 3 * vmin - 4) * 2
    plist[5].innerText = "#".repeat(length)
    arewewaiting && await wait(20)
    plist[6].innerText = "##" + "_".repeat(length - 4) + "##"
    arewewaiting && await wait(20)
    plist[7].innerText = "##" + "_".repeat(length / 2 - 7) + "!_ERROR_!" + "_".repeat(length / 2 - 6) + "##"
    arewewaiting && await wait(20)
    plist[8].innerText = "##" + "_".repeat(length / 2 - 16) + "!_NO_LOCAL_DRIVE_DETECTED_!" + "_".repeat(length / 2 - 15) + "##"
    arewewaiting && await wait(20)
    plist[9].innerText = "##" + "_".repeat(length - 4) + "##"
    arewewaiting && await wait(20)
    plist[10].innerText = plist[5].innerText
}

function loadingAnimator() {
    let p = document.getElementById("biosLoading")

    switch (p.innerText[1]) {
        case ('|'):
            p.innerText = '[/]'
            return
        case ('/'):
            p.innerText = '[-]'
            return
        case ('-'):
            p.innerText = '[\\]'
            return
        default:
            p.innerText = '[|]'
            return
    }
}