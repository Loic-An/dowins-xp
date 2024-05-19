export const displayName = 'Media Center';

export const options = {}

export const toolBar = undefined;

/**
 * @type {(windowContent:HTMLElement)=>void}
 */
export function appContent(windowContent) {
    const video = document.createElement('video');
    video.src = 'https://www.w3schools.com/html/mov_bbb.mp4';
    video.controls = true;
    video.autoplay = true;
    video.style.width = '100%';
    video.style.height = '100%';
    windowContent.appendChild(video);
}
