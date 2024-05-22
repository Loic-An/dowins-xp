export const displayName = 'Media Center';

/**
 * @type {{notMinizable?:boolean,notMaximizable?:boolean,notClosable?:boolean,notResizable?:boolean,noToolbar?:boolean,id?:string}}
 */
export const options = { id: 'mediaCenter', notResizable: true }


export const toolBar = undefined;

/**
 * @type {(windowContent:HTMLElement)=>void}
 */
export function appContent(windowContent) {
    const video = document.createElement('iframe');
    video.style.width = '80vmin';
    video.style.height = '80vmin';
    video.frameBorder = '0';
    video.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    video.allowFullscreen = true;
    video.referrerPolicy = 'strict-origin-when-cross-origin';
    video.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?si=JCM_0zKC73GwZx8r&amp;controls=0&autoplay=1';
    windowContent.appendChild(video);
}
