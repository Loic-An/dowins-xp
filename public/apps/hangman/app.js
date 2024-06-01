export const displayName = 'Hangman';

export const options = { id: 'hangman', unique: true }

/**
 * @type {(toolBar:HTMLElement)=>void}
 */
export function toolBar(toolbar) {
    const newGame = document.createElement('button')
    newGame.innerText = "New Game"
    toolbar.appendChild(newGame)
    toolbar.innerHTML += `
        <label for="difficulty" class="custom-label">Difficulty</label>
        <select id="difficulty" class="custom-select">
            <option value="easy">&#160Easy</option>
            <option value="normal">&#160Normal</option>
            <option value="hard">&#160Hard</option>
            <option value="helldive">&#160Helldive</option>
        </select>
    `

    newGame.addEventListener("pointerup", () => {
        console.log("new game")
        const dif = document.getElementById('difficulty')
        tryStartnewGame(dif.options[dif.selectedIndex].value).then(v => showNewGame(v), e => windowManager.error(e.message))
    })
    // JavaScript pour ouvrir le menu select lorsque le label est survolé
    toolbar.querySelector('.custom-label').addEventListener('mouseover', function () {
        // Simule un clic sur le menu select pour l'ouvrir
        toolbar.querySelector('.custom-select').size = 4; // '3' est le nombre d'options à afficher
    });

    toolbar.querySelector('.custom-select').addEventListener('mouseleave', function () {
        // Ferme le menu select lorsque la souris quitte le menu
        this.size = 0;
    });
    toolbar.querySelector('.custom-select').addEventListener('change', (e) => {

    })

}

/**
 * @type {(windowContent:HTMLElement)=>void}
 */
export function appContent(windowContent) {
    windowContent.id = "gameContainer"
    windowContent.innerHTML = `
        <form class="notplaying">
            <input type="text" id="lettertotry" placeholder="Enter a letter" required>
            <button type="submit">Try</button>
        </form>
        <div id="gameover"></div>
        <div id="word2guess"></div>
        <svg width="258" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect y="380" x="2" width="250" height="10" style="fill:yellow;stroke-width:4;stroke:black"></rect>
    <line x1="20" y1="380" x2="20" y2="10" style="stroke:black;stroke-width:4"></line>
    <line x1="18" y1="10" x2="140" y2="10" style="stroke:black;stroke-width:4"></line>
    <line id="i1" x1="138" y1="10" x2="138" y2="50" style="stroke:black;stroke-width:4"></line>
    <circle id="i2" cx="138" cy="80" r="30" stroke="black" stroke-width="4" fill="yellow"></circle>
    <line id="i3" x1="138" y1="110" x2="138" y2="250" style="stroke:black;stroke-width:4"></line>
    <line id="i4" x1="138" y1="140" x2="100" y2="200" style="stroke:black;stroke-width:4"></line>
    <line id="i5" x1="138" y1="140" x2="178" y2="200" style="stroke:black;stroke-width:4"></line>
    <line id="i6" x1="138" y1="250" x2="100" y2="310" style="stroke:black;stroke-width:4"></line>
    <line id="i7" x1="138" y1="250" x2="178" y2="310" style="stroke:black;stroke-width:4"></line>
</svg>
    `
    windowContent.querySelector('form')?.addEventListener('submit', testcharcallback)
    document.getElementById('lettertotry')?.addEventListener('input', charInputChecker)
    tryGetGameState().then(gameState => {
        displayGameState(gameState)
        const word = document.getElementById("word2guess")?.innerText.length
        const options = document.querySelectorAll("#difficulty option")
        if (!word || word < 9) options[0].selected = true
        else if (word < 11) options[1].selected = true
        else if (word < 13) options[2].selected = true
        else options[3].selected = true
    }, e => windowManager.error(e.message))
}
var guessedchar = ""    //stocke tous les caractères testés. Sert pour l'input de test des lettres
var isplaying = false   //permet de limiter la saisie de caractères

/**
 * Empeche de supprimer les tentatives précédentes de l'input de test, et de retenter une lettre deja testé.
 * @param {Event & {target:{value:any}}} ev 
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
    if (word)
        positions.forEach((v) => { word.innerText = word.innerText.substring(0, v) + char[0] + word.innerText.substring(v + 1) })
}

/**
 * Update the svg accordingly to the number of errors made.
 * @param {number} errors 
 */
function updateSVG(errors) {
    if (errors < 8 && -1 < errors) {
        for (let i = 1; i < 8; i++) {
            const element = document.getElementById("i" + i);
            if (element) {
                element.style.display = errors < i ? "none" : "";
            }
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
        const go = document.getElementById("gameover")
        if (go) go.innerText = 'No active game. Click on the "New Game" button.'
        document.querySelector('#gameContainer form')?.classList.add('notplaying')
    }
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
        if (!ev.target) throw new Error("no form found")
        const guesslist = ev.target.elements['lettertotry'].value
        if (guesslist.length === guessedchar.length) throw new Error("Enter a char before submitting!")
        const char = guesslist[guessedchar.length].toUpperCase()
        const guess = await try2GuessLetter(char)
        guessedchar += char
        if (!guess.isCorrect) {
            if (!guess.errors) throw new Error("no eror but incorrect")
            updateSVG(guess.errors)
        } else {
            if (!guess.positions) throw new Error("correct but no positions")
            updateWord2Guess(char, guess.positions)
        }
        if (guess.isGameOver) {
            isplaying = false
            document.querySelector('#gameContainer form')?.classList.add('notplaying')
            const gameover = document.getElementById("gameover")
            const word = document.getElementById("word2guess")
            if (!gameover || !word) throw new Error("gameover or word2guess not found")
            if ("word" in guess) {
                gameover.innerText = 'You lose. The word was ' + guess.word
            } else {
                gameover.innerText = 'You win. You found the word ' + word.innerText
            }
            gameover.innerText += '. Click on the "New Game" button to start a new game.'
            word.innerText = ""
        } else { guessedchar += "," }
        ev.target.elements['lettertotry'].value = guessedchar
    } catch (e) {
        windowManager.error(e.message)
    }
}

/**
 * Display a new game or resume an old one according to `gameState`.
 * @note This function doesn't support empty gameState.
 * @param {{wordLength:number}|{wordLength:number,nbErrors:number,correctLetters:string[],incorrectLetters:string[]}} gameState 
 */
function showNewGame(gameState) {
    const word = document.getElementById("word2guess")
    if (!word) return
    if ("correctLetters" in gameState) {
        word.innerText = gameState.correctLetters.join("")
        if (gameState.nbErrors) {
            guessedchar = gameState.incorrectLetters.join(",") + ","
        }
        let f = gameState.correctLetters.filter((v) => v != '_')
        if (f.join("").length)
            guessedchar += f.filter((v) => v != '_').join(",") + ","
        updateSVG(gameState.nbErrors)
    } else {
        word.innerText = "_".repeat(gameState.wordLength)
        guessedchar = ""
        updateSVG(0)
    }

    document.getElementById("lettertotry").value = guessedchar
    document.getElementById("gameover").innerText = ""
    document.querySelector('#gameContainer form')?.classList.remove('notplaying')
    isplaying = true
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
 * Try to recover the gameState of the current game.
 * Can be empty if there is no active game.
 * @returns {Promise<{wordLength:number,nbErrors:number,correctLetters:string[],incorrectLetters:string[]}|{}>}
 * @throws When fetch throw or token invalid.
 */
async function tryGetGameState() {
    const response = await getData(window.location.origin + "/api/gameState")
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
 * @param {"easy"|"normal"|"hard"|"helldive"} [difficulty] - The difficulty of the game.
 * @returns {Promise<{wordLength:number}>}
 * @throws When fetch throw.
 */
async function tryStartnewGame(difficulty) {
    const path = "/api/newGame" + (difficulty ? "?difficulty=" + difficulty : "")
    const response = await getData(window.location.origin + "/api/newGame")
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
    const response = await getData(window.location.origin + "/api/letter/" + char[0])
    return await response.json()
}
