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
    }

    /**
     * @param {string} title 
     * @param {string|null} imgLocation
     * @param {{notMinizable?:boolean,notMaximizable?:boolean,notClosable?:boolean,notResizable?:boolean,noToolbar?:boolean,id?:string,noResetPosition?:boolean}} options
     * @returns {HTMLDivElement} A basic window. No content, no toolbar generated
     */
    static createBasicWindow(title, imgLocation, options) {
        const approot = document.createElement('div')
        approot.classList.add('window')
        const header = document.createElement('header')
        if (imgLocation) {
            const windowLogo = document.createElement('img')
            windowLogo.src = imgLocation
            windowLogo.title = title
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
            close.title = 'close'
            close.classList.add('close')
            flexbutton.appendChild(close)
        }
        if (!options.notMaximizable) {
            const maximize = document.createElement('img')
            maximize.src = '/images/bmaximize.png'
            maximize.title = 'maximize'
            maximize.classList.add('maximize')
            flexbutton.appendChild(maximize)
        }
        if (!options.notMinizable) {
            const minimize = document.createElement('img')
            minimize.src = '/images/bminimize.png'
            minimize.title = 'minimize'
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
        if (this.options.noResetPosition) return
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