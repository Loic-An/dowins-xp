//@ts-check
export const displayName = 'Hangman';

export const options = { id: 'hangman', unique: true }

/**
 * @type {(toolBar:HTMLElement)=>void}
 */
export function toolBar(toolbar) {
    const newGame = document.createElement('button')
    const difficulty = document.createElement('button')
    newGame.innerText = "New Game"
    newGame.addEventListener("click", async () => {
        try { showNewGame(await tryStartnewGame()) } catch (e) { windowManager.error(e.message) }
    })
    difficulty.innerText = "Difficulty"


    toolbar.appendChild(newGame)
    toolbar.appendChild(difficulty)
}

/**
 * @type {(windowContent:HTMLElement)=>void}
 */
export function appContent(windowContent) {
    windowContent.innerHTML = `
        <form class="notplaying">
            <input type="text" id="lettertotry" placeholder="Enter a letter" required>
            <button type="submit">Try</button>
        </form>
        <div id="gameover"></div>
        <div id="word2guess"></div>
        <svg id="hangman" src="/images/hangman.svg"></svg>
    `
}
var guessedchar = ""    //stocke tous les caractères testés. Sert pour l'input de test des lettres
var isplaying = false   //permet de limiter la saisie de caractères

/**
 * Check localStorage's availability.
 * Grandement inspiré de ce qui se fait sur StackOverflow, j'ai rajouté un test pour être sûr de sûr
 * @author Loïc
 * @return {boolean} isAvailable
 */
function isLocalStorageAvailable() {
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        if (localStorage.getItem(test) != test) throw new Error()
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Function called when `DOMContentLoaded` fires.
 * Setup essential Event listeners.
 * Retrieve token stored in `localStorage`.
 * @param {Event} _DOMContentLoadedEvent 
 */
async function entryPoint(_DOMContentLoadedEvent) {
    document.querySelector('#logincontainer form').addEventListener("submit", logincallback)
    document.getElementById('newgame').addEventListener("click", async () => {

    })
    document.querySelector("#gameContainer form").addEventListener('submit', testcharcallback)
    document.getElementById('lettertotry').addEventListener('input', charInputChecker)
    document.getElementById('disconnect').addEventListener('click', disconnectUser)

    if (isLocalStorageAvailable()) {
        try { await recoverStoredToken() }
        catch (e) { windowManager.error(e.message) }
    }
}

/**
 * Empeche de supprimer les tentatives précédentes de l'input de test, et de retenter une lettre deja testé.
 * @param {Event} ev 
 */
function charInputChecker(ev) {
    if (isplaying && ev.target.value.length > guessedchar.length && ev.target.value[guessedchar.length].match('[a-zA-Z]')
        && guessedchar.indexOf(ev.target.value[guessedchar.length].toUpperCase()) < 0) {
        ev.target.value = guessedchar + ev.target.value[guessedchar.length].toUpperCase()
        return
    }
    ev.target.value = guessedchar
}

/**
 * 
 * @param {string} char 
 * @param {number[]} positions 
 */
function updateWord2Guess(char, positions) {
    let word = document.getElementById('word2guess')
    positions.forEach((v) => { word.innerText = word.innerText.substring(0, v) + char[0] + word.innerText.substring(v + 1) })
}

/**
 * Update the svg accordingly to the number of errors made.
 * @param {number} errors 
 */
function updateSVG(errors) {
    if (errors < 8 && -1 < errors) {
        for (let i = 1; i < 8; i++) {
            document.getElementById("i" + i).style.display = errors < i ? "none" : ""
        }
    }
}

/**
 * Display a `gameState` whether it is empty or not.
 * @param {{}|{wordLength:number,nbErrors:number,correctLetters:string[],incorrectLetters:string[]}} gameState 
 */
function displayGameState(gameState) {
    if ("wordLength" in gameState) {
        showNewGame(gameState)
    } else {
        updateSVG(7)
        document.getElementById("gameover").innerText = 'No active game. Click on the "New Game" button.'
        document.querySelector('#gameContainer form').classList.add('notplaying')
    }
}

/**
 * Try to read the stored token from `localStorage`.
 * If succesfull, call `tryGetGameState()` and update 
 * @returns 
 */
async function recoverStoredToken() {
    token = localStorage.getItem('token')
    if (token) {
        try {
            let [, payload64,] = token.split(".")
            /**
             * payload du token stocké.
             * decodage du token:
             * base64url -> base64 -> binary -> string -> Object
             * @type {{username:string,iat:number,exp:number}}
             */
            const payload = JSON.parse(atob(payload64.replace(/-/g, '+').replace(/_/g, '/').padEnd(payload64.length + (4 - (payload64.length % 4)) % 4, '=')))
            if (Math.floor(Date.now() / 1000) > payload.exp)
                throw new Error("Stored token expired. You need to login manually")
            displayGameState(await tryGetGameState())
            await showLoginForm(false)
            return
        }
        catch (e) {
            windowManager.warn(e.message);
            localStorage.removeItem('token')
        }
    }
    document.getElementById("logincontainer").classList.remove("hidden")
    token = ""
}

/**
 * Disconnect an user.
 * Revert all variable to allow a new login.
 * @description Can be use to fix an incorrect state.
 */
async function disconnectUser() {
    token = ""
    if (isLocalStorageAvailable()) localStorage.removeItem("token")
    document.querySelector("#gameContainer form").classList.add("notplaying")
    document.getElementById("word2guess").innerText = ""
    document.getElementById("gameover").innerText = ""
    isplaying = false
    updateSVG(7)
    document.getElementById("logincontainer").classList.remove("hidden")
    await showLoginForm(true)
}

/**
 * testchar form callback.
 * @param {SubmitEvent} ev 
 */
async function testcharcallback(ev) {
    ev.preventDefault()
    if (!isplaying) {
        windowManager.warn("Start a new game before submiting a character!")
        return
    }
    try {
        const guesslist = ev.target.elements['lettertotry'].value
        if (guesslist.length === guessedchar.length) throw new Error("Enter a char before submitting!")
        const char = guesslist[guessedchar.length].toUpperCase()
        const guess = await try2GuessLetter(char)
        guessedchar += char
        if (!guess.isCorrect) {
            updateSVG(guess.errors)
        } else {
            updateWord2Guess(char, guess.positions)
        }
        if (guess.isGameOver) {
            isplaying = false
            document.querySelector('#gameContainer form').classList.add('notplaying')
            if ("word" in guess) {
                document.getElementById("gameover").innerText = 'You lose. The word was ' + guess.word
            } else {
                document.getElementById("gameover").innerText = 'You win. You found the word ' + document.getElementById('word2guess').innerText
            }
            document.getElementById("gameover").innerText += '. Click on the "New Game" button to start a new game.'
            document.getElementById('word2guess').innerText = ""
        } else { guessedchar += "," }
        document.getElementById("lettertotry").value = guessedchar
    } catch (e) {
        windowManager.error(e.message)
    }
}

/**
 * Check if password is strong.
 * @param {string} password 
 * @returns {boolean}
 */
function isPasswordStrong(password) {
    if (password.length < 8) {
        windowManager.error("password must have at least 8 characters")
        return false
    }
    if (!password.match("[a-zA-Z]")) {
        windowManager.error("password must have at least 1 letter")
        return false
    }
    if (!password.match("[0-9]")) {
        windowManager.error("password must have at least 1 digit")
        return false
    }
    return true
}

/**
 * loginform' submit callback.
 * @param {SubmitEvent} submitevent 
 */
async function logincallback(submitevent) {
    submitevent.preventDefault()
    console.log(submitevent.submitter.value)
    const username = String(submitevent.target.elements["username"].value)
    const password = String(submitevent.target.elements["password"].value)
    const islogin = Boolean(submitevent.submitter.value === "login")

    if (!islogin && !isPasswordStrong(password)) return

    token = "" //making sure there is no old token
    try {
        if (!islogin) await trySignin(username, password)
        token = await tryLogin(username, password)

        windowManager.info("login successful.") //message mis après car await response.text() peut foirer :)

        if (isLocalStorageAvailable()) localStorage.setItem('token', token)
        await showLoginForm(false, true)
        displayGameState(await tryGetGameState())
    } catch (error) { windowManager.error(error.message) }
}

/**
 * Display a new game or resume an old one according to `gameState`.
 * @note This function doesn't support empty gameState.
 * @param {{wordLength:number}|{wordLength:number,nbErrors:number,correctLetters:string[],incorrectLetters:string[]}} gameState 
 */
function showNewGame(gameState) {
    if ("correctLetters" in gameState) {
        document.getElementById("word2guess").innerText = gameState.correctLetters.join("")
        if (gameState.nbErrors) {
            guessedchar = gameState.incorrectLetters.join(",") + ","
        }
        let f = gameState.correctLetters.filter((v) => v != '_')
        if (f.join("").length)
            guessedchar += f.filter((v) => v != '_').join(",") + ","
        updateSVG(gameState.nbErrors)
    } else {
        document.getElementById("word2guess").innerText = "_".repeat(gameState.wordLength)
        guessedchar = ""
        updateSVG(0)
    }
    document.getElementById("lettertotry").value = guessedchar
    document.getElementById("gameover").innerText = ""
    document.querySelector('#gameContainer form').classList.remove('notplaying')
    isplaying = true
}

/**
 * Hide or show the login form.
 * @param {boolean} isshow 
 */
async function showLoginForm(isshow, sound = false) {
    if (isshow) {
        document.getElementById("loginpage").classList.remove("hidden")
        document.getElementById("gameWindow").classList.add("hidden")
    } else {
        document.getElementById("loginpage").classList.add("hidden")
        document.getElementById("gameWindow").classList.remove("hidden")
    }
    if (sound) {
        await startupSound.play()
    }
}

/** 
 * Example POST method implementation.
 * @param {string} url 
 * @returns {Promise<Response>} A response.
 * @throws When fetch throws.
 */
async function postData(url, data = {}) {
    // Default options are marked with *
    return await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: { "Content-Type": "application/json" },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
}

/** 
 * Example GET method implementation.
 * @param {string} url 
 * @returns {Promise<Response>} A response.
 * @throws When fetch throws.
 */
async function getData(url) {
    return await fetch(url, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            'token': token
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });
}

/**
 * try to signin the user. need to be encapsulated with a try
 * @param {string} user 
 * @param {string} pass 
 * @throws when fetch throw or signin failed
 */
async function trySignin(user, pass) {
    const response = await postData(window.location.origin + "signin", { username: user, password: pass })
    const body = await response.text()
    if (!response.ok) {
        throw new Error(body)
    } else {
        windowManager.info(body)
    }
}

/**
 * try to login the user. need to be encapsulated with a try
 * @param {string} user 
 * @param {string} pass 
 * @returns {Promise<string>} token.
 * @throws when fetch throw or login failed
 */
async function tryLogin(user, pass) {
    const response = await postData(window.location.origin + "login", { username: user, password: pass })
    if (!response.ok) {
        throw new Error(await response.text())
    }
    return await response.text()
}

/**
 * Try to recover the gameState of the current game.
 * Can be empty if there is no active game.
 * @returns {Promise<{wordLength:number,nbErrors:number,correctLetters:string[],incorrectLetters:string[]}|{}>}
 * @throws When fetch throw or token invalid.
 */
async function tryGetGameState() {
    const response = await getData(window.location.origin + "gameState", token)
    if (response.ok) {
        return await response.json()
    }
    if (response.status == 400) {
        return {}
    }
    throw new Error(await response.text())
}

/**
 * Try to start a new Game.
 * Return the `wordLength`.
 * @returns {Promise<{wordLength:number}>}
 * @throws When fetch throw.
 */
async function tryStartnewGame() {
    const response = await getData(window.location.origin + "newGame")
    if (response.ok) {
        return await response.json()
    }
    throw new Error(await response.text())
}

/**
 * Try to guess a character.
 * Return a gameState.
 * @param {string} char 
 * @returns {Promise<{letter:string,isCorrect:boolean,errors?:number,isGameOver:boolean,word?:string,positions?:number[]}>}
 * @throws When fetch throw.
 */
async function try2GuessLetter(char) {
    const response = await getData(window.location.origin + "letter/" + char[0])
    return await response.json()
}
