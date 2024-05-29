function movehandler(event) {
    windowManager.clickManager.activeTarget && windowManager.clickManager.activeTarget.move(event, windowManager.clickManager.action)
}
class WindowManager {
    /**
     * @type {XPWindow[]}
     */
    windows
    /**
     * @type {HTMLDivElement}
     */
    taskbar
    /**
     * @type {HTMLDivElement}
     */
    desktop
    /**
     * @type {string[]}
     */
    apps
    /**
     * @type {HTMLDivElement|null}
     */
    desktopiconselected = null
    /**
     * @type {{activeTarget:null|XPWindow,action:null|"move"|"resizeUp"|"resizeDown"|"resizeLeft"|"resizeRight"}}
     */
    clickManager = { activeTarget: null, action: null }
    isStartMenuHidden = true
    /**
     * @param {HTMLDivElement} taskbar
     * @param {HTMLDivElement} startmenu
     * @param {HTMLDivElement} desktop
     */
    constructor(taskbar, startmenu, desktop) {
        this.windows = []
        this.taskbar = taskbar
        this.startmenu = startmenu
        this.desktop = desktop
        this.apps = []
        this.desktop.addEventListener('mouseup', () => {
            this.desktop.removeEventListener('mousemove', movehandler)
            this.clickManager.activeTarget = null
            this.clickManager.action = null
        })
    }
    /**
     * 
     * @param {XPWindow} window 
     */
    addWindow(window) {
        window.initialize()
        this.windows.push(window)
        this.desktop.appendChild(window.htmlelement)
        window.zIndex = this.windows.length + 1
        this.taskbar.style.zIndex = this.windows.length + 2
        this.startmenu.style.zIndex = this.windows.length + 3
        window.resetPosition()
        this.updateAllZIndex()
        if (!this.isStartMenuHidden) this.toggleStartMenu()
    }
    /**
     * @param {XPWindow} window 
     */
    removeWindow(window) {
        let index = this.windows.indexOf(window)
        if (index === -1) return
        this.windows.splice(index, 1)[0].remove()
        this.updateAllZIndex()

    }
    updateAllZIndex() {
        this.windows.forEach((v, i) => {
            v.zIndex = i + 2
            if (this.windows.length !== i + 1) v.htmlelement.classList.add('idleWindow')
            else v.htmlelement.classList.remove('idleWindow')
        })
        this.taskbar.style.zIndex = this.windows.length + 2
        this.startmenu.style.zIndex = this.windows.length + 3
    }
    /**
     * not used
     */
    minimizeAll() {
        this.windows.forEach(v => { if (!v.options.notMinizable) v.htmlelement.classList.add('minimized') })
    }
    /**
     * move the window to the foreground by changing its z-index, and moving it to the end of the windows array
     * executing this method will also update the z-index of all windows
     * @param {XPWindow} window
     */
    foregroundWindow(window) {
        let index = this.windows.indexOf(window)
        if (index === -1 || index === this.windows.length) return
        this.windows.push(...this.windows.splice(index, 1))
        this.updateAllZIndex()
    }
    /**
     * 
     */
    get taskbarzIndex() {
        return +this.taskbar.style.zIndex
    }
    loginWindow() {
        this.addWindow(new XPWindow('Log On to Windows', '', (div) => {
            div.innerHTML = `
            <form id="loginForm">
            <label for="username">Username :</label>
            <input type="text" id="username" name="username" autocomplete="username" required>
            <label for="password">Password :</label>
            <input type="password" id="password" name="password" autocomplete="current-password" required>
            <button type="submit">Log In</button>
            <button type="submit">Sign In</button>
            
            </form>`
            const form = div.querySelector('form')
            form.addEventListener('submit', (e) => {
                e.preventDefault()
                if (e.submitter.innerText === 'Sign In') {
                    signin(form.elements.namedItem('username').value, form.elements.namedItem('password').value)
                } else {
                    login(form.elements.namedItem('username').value, form.elements.namedItem('password').value)
                }
            })

        }, (div) => {
            div.innerHTML =
                `
        <p>Copyleft 2024</p>
        <p>Socrimoft Corporation</p>
        <img src="./images/xp480_gradient.svg" alt="xp48_gradient">
        <p>Socrimoft</p>
        <p>Dowins</p>
        <p>XP</p>
        <p>Professional</p>
        <p>Socrimoft</p>
        <div></div>`}, { notMinizable: true, notMaximizable: true, notResizable: true, notClosable: true, id: 'loginWindow', noResetPosition: true }))
    }
    /**
     * downloads apps dependencies
     */
    async preloadApps() {
        if (this.apps.length === 0) {
            if (!token) throw new Error('No token')
            let t = token.split('.')
            if (t.length !== 3) {
                localStorage.removeItem('token')
                windowManager.loginWindow()
                throw new Error('Invalid token encountered. Please log in again.')
            }
            this.apps = JSON.parse(atob(t[1])).appsInstalled || [""]
            if (this.apps[0] === "") {
                this.apps = []
                throw new Error('No apps installed')
            }
            /**
             * @type {Promise<Event>[]}
             */
            let dls = []
            this.apps.forEach((app) => {
                dls.push(new Promise((resolve, reject) => {
                    let link = document.createElement('link')
                    link.rel = 'stylesheet'
                    link.type = 'text/css'
                    link.onload = resolve;
                    link.onerror = reject;
                    document.head.appendChild(link).href = `/apps/${app}/app.css`
                }), new Promise((resolve, reject) => {
                    let script = document.createElement('script')
                    script.type = 'module'
                    script.onload = resolve
                    script.onerror = reject
                    document.head.appendChild(script).src = `/apps/${app}/app.js`
                }))
            })
            await Promise.all(dls)
        }
    }
    async loadDesktop() {
        setInterval(() => this.clockUpdater(), 2000)
        try {
            await this.preloadApps()
        } catch (e) {
            windowManager.error(e.message)
            return
        }
        // on this point, the token should be valid because the apps are loaded
        const username = JSON.parse(atob(token.split('.')[1])).sub
        this.clearWindow() // remove login window
        this.taskbar.classList.remove('hidden')
        document.querySelector('#desktopPage > img').classList.remove('hidden')
        document.getElementById('desktopIcons').classList.remove('hidden')
        document.querySelectorAll('#desktopIcons > div').forEach((v) => {
            v.addEventListener('click', (e) => {
                v.classList.toggle('selected', this.desktopiconselected !== v)
                if (this.desktopiconselected === v) {
                    windowManager.error(`Dowins cannot find "explorer.exe". Please check spelling and try again.`)
                    this.desktopiconselected = null
                    return
                }
                if (this.desktopiconselected) this.desktopiconselected.classList.remove('selected')
                this.desktopiconselected = v
            })
        })
        document.getElementById('startButton').addEventListener('click', () => this.toggleStartMenu())
        document.getElementById('startMenuUsername').innerText = username
        document.querySelectorAll('#startMenuBottom > button').forEach((v) => {
            v.addEventListener('click', () => {
                localStorage.removeItem('token')
                if (v.children[1].innerHTML === "Turn Off Computer") localStorage.removeItem('hasBooted')
                window.location.reload()
            })
        })
        this.clockUpdater()
        const startMenuleft = document.getElementById('startMenuLeft')
        const app_modules = await Promise.allSettled(this.apps.map((v) => import(`/apps/${v}/app.js`)))
        startMenuleft.innerHTML = app_modules.filter((v) => v.status === "fulfilled").map((v, i) => `<button type="button"><img src="./apps/${this.apps[i]}/app.ico" alt="${v.value.displayName}"><span>${v.value.displayName}</span></button>`).join('')
        for (let i = 0; i < app_modules.length; i++) {
            if (app_modules[i].status === 'fulfilled') {
                const app = app_modules[i].value
                startMenuleft.childNodes[i].addEventListener('click', () => {
                    try {
                        this.addWindow(new XPWindow(app.displayName, `./apps/${this.apps[i]}/app.ico`, app.appContent, app.toolbar, app.options))
                    } catch (e) {
                        windowManager.error("An error occurred while trying to open the app: " + e.message)
                    }
                })
            } else {
                windowManager.error(app_modules[i].reason.message)
            }
        }
    }
    /**
     * @param {HTMLDivElement} windowContent
     * @returns {XPWindow|null}
     */
    reverseLookup(windowContent) {
        for (const w of this.windows) {
            if (w.htmlelement.querySelector('.windowContent') === windowContent) return w
        }
        return null
    }
    clearWindow() {
        while (this.windows.length > 0) this.windows.pop().remove()
        this.updateAllZIndex()
    }
    toggleStartMenu() {
        this.startmenu.classList.toggle('hidden', this.isStartMenuHidden = !this.isStartMenuHidden)
    }
    /**
     * 
     * @param {XPWindow} target
     * @param {"move"|"resizeUp"|"resizeDown"|"resizeLeft"|"resizeRight"} action
     */
    registerActiveTarget(target, action) {
        this.clickManager.activeTarget = target
        this.clickManager.action = action
        this.desktop.addEventListener('mousemove', movehandler)
    }
    popWindow() {
        if (this.windows.length > 0) {
            this.windows.pop().remove()
            this.updateAllZIndex()
        }
    }
    error(message) {
        this.addWindow(new XPWindow('Error', '', (div) => {
            div.innerHTML = `<p>${message}</p>`
        }, null, { notMinizable: true, notMaximizable: true, notResizable: true, notClosable: false }))
    }
    warn(message) {
        this.addWindow(new XPWindow('Warning', '', (div) => {
            div.innerHTML = `<p>${message}</p>`
        }, null, { notMinizable: true, notMaximizable: true, notResizable: true, notClosable: false }))
    }
    log(message) {
        this.addWindow(new XPWindow('Log', '', (div) => {
            div.innerHTML = `<p>${message}</p>`
        }, null, { notMinizable: true, notMaximizable: true, notResizable: true, notClosable: false }))
    }
    clockUpdater() {
        const date = new Date()
        const hour = (date.getUTCHours() % 12 || 12).toString().padStart(2, '0')
        const minute = date.getMinutes().toString().padStart(2, '0')
        const ampm = date.getUTCHours() >= 12 ? 'PM' : 'AM'
        this.taskbar.querySelector('#taskBarTime span').innerText = `${hour}:${minute} ${ampm}`
    }
}