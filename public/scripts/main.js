var token = ""
const windowManager = new WindowManager(document.getElementById('taskBar'), document.getElementById('startMenu'), document.getElementById('desktopPage'))
console.log('windowmanager created')
window.addEventListener("DOMContentLoaded", entrypoint)

function entrypoint() {
    console.log("DOMContentLoaded")
    const bootPage = document.getElementById("bootPage")
    const startupbutton = document.querySelector("#bootPage button")
    if (isLocalStorageAvailable() && ((token = localStorage.getItem("token")) || localStorage.getItem("hasBooted"))) {
        startWindows()
    } else {
        bootPage.classList.remove("hidden")
        startupbutton.addEventListener('click', biosSequence)
    }
}
