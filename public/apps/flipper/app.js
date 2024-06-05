export const displayName = '3D Pinball Space Cadet';

/**
 * @type {{
 *          preRun: never[];
 *          postRun: never[];
 *          print: (text: any, ...args: any[]) => void;
 *          printErr: (text: any, ...args: any[]) => void;
 *          canvas: Element | null;
 *          setStatus: (text: any) => void;
 *          totalDependencies: number;
 *          monitorRunDependencies: typeof monitorRunDependencies;}}
 */
export var Module;
var statusElement;
var progressElement;

export const options = { id: 'flipper', unique: true, notResizable: true };

/**
 * @type {(toolBar:HTMLElement)=>void}
 */
export const toolBar = undefined

/**
 * @type {(windowContent:HTMLElement)=>void}
 */
export function appContent(windowContent) {
    let iframe = document.createElement('iframe')
    iframe.src = window.location.origin + '/apps/flipper/SpaceCadetPinball.html'
    windowContent.appendChild(iframe)
}
