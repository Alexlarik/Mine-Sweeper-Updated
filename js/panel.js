'use strict'

document.querySelector('.panel').addEventListener('click', function (event) {
    if (event.target.classList.contains('difficulty')) {
        setDifficulty(event.target.innerText.toLowerCase())
    }
})

function setDifficulty(difficulty) {
    resetGame()

    if (difficulty === 'easy') {
        gLevel.SIZE = gOriginalLevel.SIZE
        gLevel.BOMB = gOriginalLevel.BOMB
        gHints = resetHints
    } else if (difficulty === 'medium') {
        gLevel.SIZE = gOriginalLevel.SIZE * 2
        gLevel.BOMB = gOriginalLevel.BOMB * 4
        gHints = resetHints
    } else if (difficulty === 'hard') {
        gLevel.SIZE = gOriginalLevel.SIZE * 4
        gLevel.BOMB = gOriginalLevel.BOMB * 8
        gHints = resetHints
    } else {
        gLevel.SIZE = gOriginalLevel.SIZE
        gLevel.BOMB = gOriginalLevel.BOMB
        gHints = resetHints
    }

    onInit()
    updateTimer()
    console.log('Difficulty set to:', difficulty + ',', 'mines count:', gLevel.BOMB)
}

function startTimer() {
    gGame.timerInterval = setInterval(function () {
        gGame.secsPassed++
        updateTimer()
    }, 1000)
}

function updateTimer() {
    var elTimer = document.querySelector('.timer')
    elTimer.textContent = 'Timer: ' + (gGame.secsPassed / 10)
}

function stopTimer() {
    clearInterval(gGame.timerInterval)
    gGame.timerInterval = null
    gGame.secsPassed = 0
}

function resetGame() {
    stopTimer()
    gGame.isOn = false
    gGame.secsPassed = 0
    gGame.timerInterval = null
    gGame.lives = LIVES
    remainingMines = gLevel.BOMB
    gHints = resetHints
    gBoard = buildBoard()
    renderBoard(gBoard)
    changeSmiley()
    updateLives()
    updateTimer()
    startTimer()
    updateHintsAmount()
    var elSmiley = document.querySelector('.smiley')
    elSmiley.textContent = '😃'
}

function changeSmiley() {
    var elSmiley = document.querySelector('.smiley')

    if (gGame.isOn) {
        elSmiley.textContent = '😃'
    } else if (gGame.lives === 0) {
        elSmiley.textContent = '🤯'
    } else if (checkWinCondition()) {
        elSmiley.textContent = '😎'
    }

}

function updateLives() {
    var elLivesDisplay = document.getElementById('lives')
    elLivesDisplay.textContent = 'Lives: ' + gGame.lives

}

function useHints() {
    if (gHints > 0 && gGame.isOn) {
        gGame.isOn = false
        gHints--
        updateHintsAmount()

        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {
                revealCell(i, j)
            }
        }

        setTimeout(function () {
            for (var i = 0; i < gBoard.length; i++) {
                for (var j = 0; j < gBoard[i].length; j++) {
                    hideCell(i, j)
                }
            }

            setTimeout(function () {
                gGame.isOn = true
                changeSmiley()
            }, 1000)
        }, 1000)
    }
}

function hideCell(row, col) {
    const cell = gBoard[row][col]
    cell.isShown = false
    renderBoard(gBoard)
}

function updateHintsAmount() {
    var elHint = document.querySelector('.hint-amount')
    elHint.textContent = gHints
}


