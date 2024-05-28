var token = ""
const windowManager = new WindowManager(document.getElementById('taskBar'), document.getElementById('startMenu'), document.getElementById('desktopPage'))
window.addEventListener("DOMContentLoaded", entrypoint)

function entrypoint() {
    /*window.addEventListener('resize', () => {
        if (window.innerWidth < window.innerHeight) {
            BSoD("Portrait mode unexpected", 0, 0)
        }
    })*/
    const bootPage = document.getElementById("bootPage")
    const startupbutton = document.querySelector("#bootPage button")
    if (isLocalStorageAvailable() && ((token = localStorage.getItem("token")) || localStorage.getItem("hasBooted"))) {
        startDowins()
    } else {
        bootPage.classList.remove("hidden")
        startupbutton.addEventListener('click', biosSequence)
    }
}
