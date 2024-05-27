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
            token = text
            console.log(text)
            localStorage.setItem('token', text)
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
        windowManager.toggleStartMenu()
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
            <input type="password" id="password" name="password" required>
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
        <div></div>`}, { notMinizable: true, notMaximizable: true, notResizable: true, notClosable: true, id: 'loginWindow' }))
    }
    /**
     * downloads apps dependencies
     */
    async preloadApps() {
        if (this.apps.length === 0) {
            //this.apps = (JSON.parse(localStorage.getItem('apps')) || await (await fetch('/api/appsInstalled', { headers: { "token": token } })).json()).appsInstalled || [""]
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
        console.log(username)
        this.clearWindow() // remove login window
        this.taskbar.classList.remove('hidden')
        document.querySelector('#desktopPage > img').classList.remove('hidden')
        //document.getElementById('desktopPage').addEventListener('click', (e) => { console.log(e.currentTarget); document.querySelectorAll('.selected').forEach((v) => v.classList.remove('selected')) })
        document.getElementById('desktopIcons').classList.remove('hidden')
        document.querySelectorAll('#desktopIcons > div').forEach((v) => {
            //v.addEventListener('dblclick', () => windowManager.error(`Dowins couldn't find "explorer.exe". Please check spelling and try again.`))
            v.addEventListener('click', (e) => {
                console.log("bb")
                if (v.classList.contains('selected')) {
                    windowManager.error(`Dowins cannot find "explorer.exe". Please check spelling and try again.`)
                }
                v.classList.toggle('selected')
            })
        })
        document.getElementById('startButton').addEventListener('click', () => this.toggleStartMenu())
        document.getElementById('startMenuUsername').innerText = username
        document.querySelectorAll('#startMenuBottom > button').forEach((v) => {
            v.addEventListener('click', () => {
                localStorage.removeItem('token')
                console.log(v.children[1].innerHTML)
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
    clearWindow() {
        while (this.windows.length > 0) this.windows.pop().remove()
        this.updateAllZIndex()
    }
    toggleStartMenu() {
        this.startmenu.classList.toggle('hidden', this.isStartMenuVisible = !this.isStartMenuVisible)
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
class XPWindow {
    title
    imgLocation
    options
    htmlelement
    content
    toolbar

    /**
     * @param {string} title 
     * @param {string|null} imgLocation
     * @param {(windowContent:HTMLElement)=>void} [appcontent]
     * @param {(toolBar:HTMLElement)=>void} [toolbar] 
     * @param {{notMinizable?:boolean,notMaximizable?:boolean,notClosable?:boolean,notResizable?:boolean,noToolbar?:boolean,id?:string}} options
     */
    constructor(title, imgLocation, appcontent, toolbar, options = {}) {
        this.title = title
        this.imgLocation = imgLocation
        this.options = options
        this.options.noToolbar = options.noToolbar || !toolbar
        this.htmlelement = XPWindow.createBasicWindow(title, imgLocation, this.options)
        this.content = appcontent
        this.toolbar = toolbar
        console.log(this.htmlelement)
    }

    /**
     * @param {string} title 
     * @param {string|null} imgLocation
     * @param {{notMinizable?:boolean,notMaximizable?:boolean,notClosable?:boolean,notResizable?:boolean,noToolbar?:boolean,id?:string}} options
     * @returns {HTMLDivElement} A basic window. No content, no toolbar generated
     */
    static createBasicWindow(title, imgLocation, options) {
        const approot = document.createElement('div')
        approot.classList.add('window')
        const header = document.createElement('header')
        if (imgLocation) {
            const windowLogo = document.createElement('img')
            windowLogo.src = imgLocation
            header.appendChild(windowLogo)
        }
        const windowTitle = document.createElement('span')
        header.appendChild(windowTitle)
        windowTitle.innerText = title
        const flexbutton = document.createElement('div')
        flexbutton.classList.add('windowButtonContainer')
        if (!options.notClosable) {
            const close = document.createElement('img')
            close.src = '/images/bclose.png'
            close.classList.add('close')
            flexbutton.appendChild(close)
        }
        if (!options.notMaximizable) {
            const maximize = document.createElement('img')
            maximize.src = '/images/bmaximize.png'
            maximize.classList.add('maximize')
            flexbutton.appendChild(maximize)
        }
        if (!options.notMinizable) {
            const minimize = document.createElement('img')
            minimize.src = '/images/bminimize.png'
            minimize.classList.add('minimize')
            flexbutton.appendChild(minimize)
        }
        header.append(flexbutton)
        //approot.classList.add('resizable')
        const resizerUp = document.createElement('div')
        resizerUp.classList.add('windowUp')
        const resizerDown = document.createElement('div')
        resizerDown.classList.add('windowDown')
        const resizerLeft = document.createElement('div')
        resizerLeft.classList.add('windowLeft')
        const resizerRight = document.createElement('div')
        resizerRight.classList.add('windowRight')
        if (!options.notResizable) {
            resizerDown.classList.add('resizer')
            resizerUp.classList.add('resizer')
            resizerLeft.classList.add('resizer')
            resizerRight.classList.add('resizer')
        }
        approot.appendChild(resizerUp)
        approot.appendChild(resizerDown)
        approot.appendChild(resizerLeft)
        approot.appendChild(resizerRight)
        approot.appendChild(header)
        if (!options.noToolbar) {
            const toolbar = document.createElement('div')
            toolbar.classList.add('toolbar')
            approot.appendChild(toolbar)
        }
        const content = document.createElement('div')
        content.classList.add('windowContent')
        approot.appendChild(content)
        return approot
    }
    /**
     * Renders the window. This method should be called only once by the WindowManager.
     */
    initialize() {
        this.content && this.content(this.htmlelement.querySelector('.windowContent'))
        this.toolbar && this.toolbar(this.htmlelement.querySelector('.toolbar'))
        this.options.id && this.htmlelement.setAttribute('id', this.options.id)
        //initialize event listeners
        this.htmlelement.querySelector('header').addEventListener('mousedown', (e) => {
            if (this.htmlelement.classList.contains('maximized')) return
            if (this.htmlelement.classList.contains('minimized')) return
            windowManager.foregroundWindow(this)
            windowManager.registerActiveTarget(this, "move")
        })
        if (!this.options.notMinizable) {
            this.htmlelement.querySelector('.minimize').addEventListener('click', () => {
                this.htmlelement.classList.toggle('minimized')
            })
        }
        if (!this.options.notMaximizable) {
            this.htmlelement.querySelector('.maximize').addEventListener('click', () => {
                this.htmlelement.classList.toggle('maximized')
            })
        }
        if (!this.options.notClosable) {
            this.htmlelement.querySelector('.close').addEventListener('mouseup', () => {
                windowManager.removeWindow(this)
            })
        }
        if (!this.options.notResizable) {
            this.htmlelement.querySelector('.windowUp').addEventListener('mousedown', (e) => {
                if (this.htmlelement.classList.contains('maximized')) return
                if (this.htmlelement.classList.contains('minimized')) return
                windowManager.registerActiveTarget(this, "resizeUp")
            })
            this.htmlelement.querySelector('.windowDown').addEventListener('mousedown', (e) => {
                if (this.htmlelement.classList.contains('maximized')) return
                if (this.htmlelement.classList.contains('minimized')) return
                windowManager.registerActiveTarget(this, "resizeDown")
            })
            this.htmlelement.querySelector('.windowLeft').addEventListener('mousedown', (e) => {
                if (this.htmlelement.classList.contains('maximized')) return
                if (this.htmlelement.classList.contains('minimized')) return
                windowManager.registerActiveTarget(this, "resizeLeft")
            })
            this.htmlelement.querySelector('.windowRight').addEventListener('mousedown', (e) => {
                if (this.htmlelement.classList.contains('maximized')) return
                if (this.htmlelement.classList.contains('minimized')) return
                windowManager.registerActiveTarget(this, "resizeRight")
            })
        }
    }
    /**
     * moves the window according to the mouse position
     * @param {MouseEvent} e
     * @param {"move"|"resizeUp"|"resizeDown"|"resizeLeft"|"resizeRight"} action 
     */
    move(e, action) {
        switch (action) {
            case "move":
                this.htmlelement.style.left = (this.htmlelement.offsetLeft + e.movementX) + 'px'
                this.htmlelement.style.top = (this.htmlelement.offsetTop + e.movementY) + 'px'
                return
            case "resizeUp":
                this.htmlelement.style.height = (this.htmlelement.offsetHeight - e.movementY) + 'px'
                this.htmlelement.style.top = (this.htmlelement.offsetTop + e.movementY) + 'px'
                return
            case "resizeDown":
                this.htmlelement.style.height = (this.htmlelement.offsetHeight + e.movementY) + 'px'
                return
            case "resizeLeft":
                this.htmlelement.style.width = (this.htmlelement.offsetWidth - e.movementX) + 'px'
                this.htmlelement.style.left = (this.htmlelement.offsetLeft + e.movementX) + 'px'
                return
            case "resizeRight":
                this.htmlelement.style.width = (this.htmlelement.offsetWidth + e.movementX) + 'px'
                return
            default:
                return
        }
    }
    /**
     * resets the position of the window according to the z-index
     */
    resetPosition() {
        this.htmlelement.style.left = (this.zIndex - 1) * 3 + 'vmin'
        this.htmlelement.style.top = (this.zIndex - 1) * 3 + 'vmin'
    }
    remove() {
        this.htmlelement.remove()
    }
    get zIndex() {
        return +this.htmlelement.style.zIndex
    }
    set zIndex(v) {
        this.htmlelement.style.zIndex = v
    }
}