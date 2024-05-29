const startupSound = new Audio('/sounds/startup.mp3')
async function startDowins() {
    document.getElementById('bootPage').classList.add('hidden')
    document.getElementById('desktopPage').classList.remove('hidden')
    if (isLocalStorageAvailable() && (token = localStorage.getItem("token"))) {
        windowManager.loadDesktop()
    } else {
        await wait(1000)
        windowManager.loginWindow()
    }
}
async function login(username, password) {
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        const text = await res.text()
        if (res.ok) {
            localStorage.setItem('token', token = text)
            windowManager.loadDesktop()
            return
        }
        throw new Error(text)
    } catch (e) {
        windowManager.error(e.message || "An error occurred while trying to log in.")
    }
}
async function signin(username, password) {
    try {
        const res = await fetch('/api/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        const text = await res.text()
        if (res.ok) windowManager.log(data)
        throw new Error(text)
    } catch (error) {
        windowManager.error(error.message || "An error occurred while trying to sign in.");
    }
}