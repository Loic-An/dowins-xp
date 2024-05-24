export const displayName = 'Command Prompt';

export const options = { id: 'commandPrompt' }
let ps = []

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
                this.addText('C:/>')
                break
            case 'Backspace':
                this.removeChar()
                break
            case 'ArrowLeft':
            case 'ArrowRight':
                break
            case 'ArrowUp':
            case 'ArrowDown':
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
        this.history.push(command)
        this.addText(`'${command}' is not recognized as an internal or external command, operable program or batch file.\nC:/>`)
        this.windowContent.appendChild(document.createElement('p')).textContent = '▮'
        this.blinking = true
    }
}

function getBrowserVersion() {
    return navigator.userAgent.split(' ').filter(e => e.includes('/')).flatMap(e => e.split('/')).filter((_, i) => i % 2).sort((a, b) => b.length - a.length)[0]
}