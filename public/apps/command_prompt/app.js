export const displayName = 'Command Prompt';

export const options = { id: 'commandPrompt' }

/**
 * @type {(toolBar:HTMLElement)=>void}
 */
export const toolbar = undefined

/**
 * @type {(windowContent:HTMLElement)=>void}
 */
export function appContent(windowContent) {
    new Prompt(windowContent)
}
class Prompt {
    /**
     * @type {HTMLParagraphElement[]}
     */
    ps = []
    /**
     * @type {number[]}
     */
    initialSize = []
    blinking = false
    /**
     * @type {string[]}
     */
    history = []
    historyIndex = 0
    windowContent
    /**
     * @param {HTMLElement} windowContent
     */
    constructor(windowContent) {
        this.windowContent = windowContent
        this.addText(`Socrimoft Dowins [Version ${getBrowserVersion()}]\n(c) 2024 Socrimoft Corporation. No right reserved.\n\nC:/>`)
        window.addEventListener('keydown', e => this.keydownHandler(e))
        windowContent.appendChild(document.createElement('p')).textContent = '▮'
        this.blinking = true
        setInterval(() => this.blinker(), 800)
    }
    /**
     * @param {string} text 
     */
    addText(text) {
        for (const line of text.split('\n')) {
            this.ps.push(document.createElement('p'))
            this.ps[this.ps.length - 1].textContent = line
            this.initialSize.push(line.length)
            this.windowContent.appendChild(this.ps[this.ps.length - 1])
        }
    }
    /**
     * @param {KeyboardEvent} e 
     */
    keydownHandler(e) {
        switch (e.key) {
            case 'Enter':
                if (this.ps[this.ps.length - 1].textContent !== 'C:/>') this.executeCommand()
                else this.addText('C:/>')
                break
            case 'Backspace':
                this.removeChar()
                break
            case 'ArrowLeft':
            case 'ArrowRight':
                //flemme de le faire
                break
            case 'ArrowUp':
                if (this.historyIndex > 0) {
                    this.ps[this.ps.length - 1].textContent = 'C:/>' + this.history[--this.historyIndex]
                } else this.ps[this.ps.length - 1].textContent = 'C:/>'
                break
            case 'ArrowDown':
                if (this.historyIndex < this.history.length - 1) {
                    this.ps[this.ps.length - 1].textContent = 'C:/>' + this.history[++this.historyIndex]
                } else this.ps[this.ps.length - 1].textContent = 'C:/>'
                break
            default:
                console.log(e.key)
                e.key.length === 1 && this.appendText(e.key)
        }
    }
    /**
     * @param {string} text 
     */
    appendText(text) {
        this.ps[this.ps.length - 1].textContent += text
    }
    removeChar() {
        if (this.ps[this.ps.length - 1].textContent.length > this.initialSize[this.ps.length - 1])
            this.ps[this.ps.length - 1].textContent = this.ps[this.ps.length - 1].textContent.slice(0, -1)
    }
    blinker() {
        this.blinking && (this.windowContent.lastChild.textContent = this.windowContent.lastChild.textContent !== '' ? '' : '▮')
    }
    executeCommand() {
        this.blinking = false
        this.windowContent.lastChild.remove()
        const command = this.ps[this.ps.length - 1].textContent.slice(this.initialSize[this.ps.length - 1])
        switch (command) {
            case 'cls':
            case 'clear':
                this.ps.forEach(e => e.remove())
                this.ps = []
                this.addText('C:/>')
                break
            case 'history':
                this.addText(this.history.join('\n') + '\nC:/>')
                break
            case 'exit':
                const window = windowManager.reverseLookup(this.windowContent)
                if (window) windowManager.removeWindow(window)
                else this.addText(`'exit' is not recognized as an internal or external command, operable program or batch file.\nC:/>`)
                break
            case 'whoami':
                this.addText(`${document.getElementById('startMenuUsername').innerText}\nC:/>`)
                break
            default:
                this.addText(`'${command}' is not recognized as an internal or external command, operable program or batch file.\nC:/>`)
                break
        }
        this.history.push(command)
        this.historyIndex++
        this.windowContent.appendChild(document.createElement('p')).textContent = '▮'
        this.blinking = true
    }
}

function getBrowserVersion() {
    return navigator.userAgent.split(' ').filter(e => e.includes('/')).flatMap(e => e.split('/')).filter((_, i) => i % 2).sort((a, b) => b.length - a.length)[0]
}