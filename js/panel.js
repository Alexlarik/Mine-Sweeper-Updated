'use strict'

document.querySelector('.panel').addEventListener('click', function (event) {
    if (event.target.classList.contains('difficulty')) {
        setDifficulty(event.target.innerText.toLowerCase())
    }
})

function setDifficulty(difficulty) {

    if (difficulty === 'easy') {
        gLevel.SIZE = gOriginalLevel.SIZE
        gLevel.BOMB = gOriginalLevel.BOMB
    } else if (difficulty === 'medium') {
        gLevel.SIZE = gOriginalLevel.SIZE * 2
        gLevel.BOMB = gOriginalLevel.BOMB * 4
    } else if (difficulty === 'hard') {
        gLevel.SIZE = gOriginalLevel.SIZE * 4
        gLevel.BOMB = gOriginalLevel.BOMB * 8
    } else {
        gLevel.SIZE = gOriginalLevel.SIZE
        gLevel.BOMB = gOriginalLevel.BOMB
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
    gBoard = buildBoard()
    renderBoard(gBoard)
    changeSmiley()
    updateLives()
    updateTimer()
    startTimer()
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
