function startWindows() {
    document.getElementById('bootPage').classList.add('hidden')
    document.getElementById('desktopPage').classList.remove('hidden')
    if (isLocalStorageAvailable() && (token = localStorage.getItem("token"))) {
        windowManager.loadDesktop()
    } else {
        windowManager.loginWindow()
    }
}
function login(username, password) {
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: JSON.stringify({ username, password })
    }).then((response) => {
        return response.text()
    }).then((data) => {
        if (data) {
            token = data
            localStorage.setItem('token', data)
            windowManager.loadDesktop()
        }
    }).catch((error) => {
        console.error('There has been a problem with your fetch operation:', error);
    })
}
function signin(username, password) {
    fetch('/api/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    }).then((response) => {
        return response.text()
    }).then((data) => {
        windowManager.warn(data)
    }
    ).catch((error) => {
        windowManager.error('There has been a problem with your fetch operation:', error);
    })
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
     * @param {HTMLDivElement} taskbar
     * @param {HTMLDivElement} desktop
     */
    constructor(taskbar, desktop) {
        this.windows = []
        this.taskbar = taskbar
        this.desktop = desktop
        this.apps = []
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
        //this.updateAllZIndex()
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
        this.windows.forEach((v, i) => v.zIndex = i + 2)
        this.taskbar.style.zIndex = this.windows.length + 2
    }
    /**
     * 
     */
    minimizeAll() {
        this.windows.forEach(v => { if (!v.options.notMinizable) v.htmlelement.classList.add('minimized') })
    }
    /**
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
            div.innerHTML = `<div id="loginFormContainer">
            <form id="loginForm">
            <label for="username">Username :</label>
            <input type="text" id="username" name="username" autocomplete="username" required>
            <label for="password">Password :</label>
            <input type="password" id="password" name="password" required>
            <button type="submit">Log In</button>
            <button type="submit">Sign In</button>
            
            </form>
            </div>`
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
        <div>
        <p>Copyright 2024</p>
        <p>Socrimoft Corporation</p>
        </div>
        <div>
        <img src="./images/xp48_gradient.svg" alt="xp48_gradient">
        <p>Socrimoft</p>
        <p>Windows</p>
        <p>XP</p>
        <p>Professional</p>
        </div>
        <p>Socrimoft</p>`}, { notMinizable: true, notMaximizable: true, notResizable: true, notClosable: true, id: 'loginWindow' }))
    }
    /**
     * downloads 
     */
    async preloadApps() {
        if (this.apps.length === 0) {
            //this.apps = (JSON.parse(localStorage.getItem('apps')) || await (await fetch('/api/appsInstalled', { headers: { "token": token } })).json()).appsInstalled || [""]
            if (!token) throw new Error('No token')
            let t = token.split('.')
            if (t.length !== 3) throw new Error('Invalid token')
            this.apps = JSON.parse(atob(t[1])).appsInstalled || [""]
            if (this.apps[0] === "") {
                this.apps = []
                throw new Error('No apps installed')
            }
            let link = null
            let script = null
            for (const app of this.apps) {
                script = document.createElement('script')
                script.src = `/apps/${app}/app.js`
                script.type = "text/javascript"
                document.head.appendChild(script)
                link = document.createElement('link')
                link.rel = 'stylesheet'
                link.type = 'text/css'
                link.href = `/apps/${app}/app.css`
                document.head.appendChild(link)
            }
        }
    }
    async loadDesktop() {
        try {
            await this.preloadApps()
        } catch {
            windowManager.error("Couldn't load user desktop. Please try again later.")
            return
        }
        const username = JSON.parse(atob(token.split('.')[1])).sub
        console.log(username)
        this.clearWindow() // remove login window
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
        document.getElementById('startButton').addEventListener('click', () => {
            document.getElementById('startMenu').classList.toggle('hidden')
        })
        document.getElementById('startMenuUsername').innerText = username

    }
    clearWindow() {
        while (this.windows.length > 0) this.windows.pop().remove()
        this.updateAllZIndex()
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
        this.htmlelement = XPWindow.createBasicWindow(title, imgLocation, options)
        this.content = appcontent
        this.toolbar = toolbar
        console.log(this.htmlelement)
    }

    /**
     * @param {string} title 
     * @param {string|null} imgLocation
     * @param {{notMinizable?:boolean,notMaximizable?:boolean,notClosable?:boolean,notResizable?:boolean,noToolbar?:boolean,id?:string}} options
     * @returns {HTMLDivElement} A basic window. No content, no toolbar generated
     * @static
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
        if (!options.notMinizable) {
            const minimize = document.createElement('button')
            minimize.classList.add('minimize')
            header.appendChild(minimize)
        }
        if (!options.notMaximizable) {
            const maximize = document.createElement('button')
            maximize.classList.add('maximize')
            header.appendChild(maximize)
        }
        if (!options.notClosable) {
            const close = document.createElement('button')
            close.classList.add('close')
            header.appendChild(close)
        }

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
            resizerUp.addEventListener('mousedown', (e) => {
                approot.style.height = (approot.offsetHeight - e.movementY) + 'px'
                approot.style.top = (approot.offsetTop + e.movementY) + 'px'
            })
            resizerDown.addEventListener('mousedown', (e) => {
                approot.style.height = (approot.offsetHeight + e.movementY) + 'px'
            })
            resizerLeft.addEventListener('mousedown', (e) => {
                approot.style.width = (approot.offsetWidth - e.movementX) + 'px'
                approot.style.left = (approot.offsetLeft + e.movementX) + 'px'
            })
            resizerRight.addEventListener('mousedown', (e) => {
                approot.style.width = (approot.offsetWidth + e.movementX) + 'px'
            })
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
        const funmove = (e) => this.move(e)
        //initialize event listeners
        this.htmlelement.querySelector('header').addEventListener('mousedown', (e) => {
            console.log("bite")
            windowManager.foregroundWindow(this)
            this.htmlelement.querySelector('header').addEventListener('mousemove', funmove)
        })
        this.htmlelement.querySelector('header').addEventListener('mouseout', (e) => {
            this.htmlelement.querySelector('header').removeEventListener('mousemove', funmove)
        })
        this.htmlelement.querySelector('header').addEventListener('mouseup', (e) => {
            this.htmlelement.querySelector('header').removeEventListener('mousemove', funmove)
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
    }
    /**
     * moves the window according to the mouse position
     * @param {MouseEvent} MouseEvent
     */
    move(MouseEvent) {
        this.htmlelement.style.left = (this.htmlelement.offsetLeft + MouseEvent.movementX) + 'px'
        this.htmlelement.style.top = (this.htmlelement.offsetTop + MouseEvent.movementY) + 'px'
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