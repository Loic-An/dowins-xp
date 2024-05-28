export const displayName = 'Internet Explorer';

const urlbar = document.createElement('input');
const frame = document.createElement('iframe');
/**
 * @type {{notMinizable?:boolean,notMaximizable?:boolean,notClosable?:boolean,notResizable?:boolean,noToolbar?:boolean,id?:string}}
 */
export const options = { id: 'internetExplorer' }

/**
 * @type {(toolBar:HTMLElement)=>void}
 */
export function toolBar(toolbar) {
    const homeButton = document.createElement('button');
    homeButton.textContent = 'Home';
    homeButton.onclick = () => loadURL('about:blank');
    toolbar.appendChild(homeButton);
    urlbar.type = 'text';
    urlbar.id = 'urlbar';
    urlbar.placeholder = 'Enter URL';
    urlbar.value = 'about:blank';
    urlbar.onkeydown = (event) => {
        if (event.key === 'Enter') {
            loadURL(urlbar.value);
        }
    }
    goButton = document.createElement('button');
    goButton.textContent = 'Go';
    goButton.onclick = () => loadURL(urlbar.value);
    toolbar.appendChild(goButton);
    frame.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-top-navigation allow-top-navigation-by-user-activation allow-downloads ';
    toolbar.appendChild(urlbar);
}

/**
 * @type {(windowContent:HTMLElement)=>void}
 */
export function appContent(window) {
    //iframe.addEventListener('load', () => { console.log(iframe.contentWindow.location.href); urlbar.value = iframe.contentWindow.location.href; });
    window.appendChild(frame);
    iframeURLChange(frame, (url) => console.log(url));
    console.log(frame.contentWindow)
    //console.log(iframe.contentWindow.location.href)
}

function loadURL(url) {
    frame.src = url;
}
/**
 * @param {HTMLIFrameElement} iframe 
 * @param {Function} callback 
 */
function iframeURLChange(iframe, callback) {
    var unloadHandler = function () {
        // Timeout needed because the URL changes immediately after
        // the `unload` event is dispatched.
        setTimeout(function () {
            callback(iframe.contentWindow.location.href);
        }, 0);
    };

    /**
     * 
     * @param {HTMLIFrameElement} f
     * @param {Event} e 
     */
    function attachUnload(f, e) {
        // Remove the unloadHandler in case it was already attached.
        // Otherwise, the change will be dispatched twice.
        f.contentWindow.removeEventListener("unload", unloadHandler);
        f.contentWindow.addEventListener("unload", unloadHandler);
    }

    iframe.addEventListener("load", attachUnload);
    attachUnload();
}
