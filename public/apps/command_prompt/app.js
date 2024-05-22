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
    windowContent
    /**
     * @param {HTMLElement} windowContent
     */
    constructor(windowContent) {
        this.windowContent = windowContent
        this.addText(`Socrimoft Dowins [Version ${getBrowserVersion()}]`)
        this.addText('(c) 2024 Socrimoft Corporation. No right reserved.')
        this.addText(' ')
        this.addText('C:/>')
    }
    addText(text) {
        this.ps.push(document.createElement('p'))
        this.ps[this.ps.length - 1].textContent = text
        this.initialSize.push(text.length)
        this.windowContent.appendChild(this.ps[this.ps.length - 1])
    }
    appendText(text) {
        this.ps[this.ps.length - 1].textContent += text
    }
    removeChar() {
        if (this.ps[this.ps.length - 1].textContent.length > this.initialSize[this.ps.length - 1])
            this.ps[this.ps.length - 1].textContent = this.ps[this.ps.length - 1].textContent.slice(0, -1)
    }
}

function getBrowserVersion() {

    return navigator.userAgent.split(' ').filter(e => e.includes('/')).flatMap(e => e.split('/')).filter((_, i) => i % 2).sort((a, b) => b.length - a.length)[0]
}