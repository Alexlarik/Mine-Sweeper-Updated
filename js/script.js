'use strict'
/////////////////
const MARK = '🚩'
const BOMB = '💣'
const SPACE = ' '
var LIVES = 3
var remainingMines
var gBoard

////////////////
//Message to self: fix flag problem, fix css, implement lives,win condition.
////////////////
var gLevel = {
    SIZE: 4,
    BOMB: 2
}

var originalLevel = {
    SIZE: gLevel.SIZE,
    BOMB: gLevel.BOMB
}

var gGame = {
    isOn: false,
    secsPassed: 0,
    timerInterval: null,
    markedCount: 0
}

function onInit() {
    stopTimer()
    remainingMines = gLevel.BOMB
    gGame.isOn = true
    gBoard = buildBoard()
    renderBoard(gBoard)
    startTimer()
    console.log(gBoard)
}

function buildBoard() {
    const rows = gLevel.SIZE
    const cols = gLevel.SIZE
    const board = createMat(rows, cols)
    const minesPositions = placeMines(gLevel.BOMB, rows, cols)

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var isMine = false
            for (var x = 0; x < minesPositions.length; x++) {
                const position = minesPositions[x]
                const { row, col } = position
                if (row === i && col === j) {
                    isMine = true
                    break
                }
            }
            const minesAroundCount = isMine ? 0 : setMinesNegsCount(board, i, j)
            board[i][j] = {
                value: isMine ? BOMB : SPACE,
                isMine: isMine,
                isShown: false,
                isMarked: false,
                minesAroundCount: minesAroundCount

            }
        }
    }

    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<table>'
        for (var j = 0; j < board[i].length; j++) {
            strHTML += '<td>'
            const cell = board[i][j]
            const cellValue = cell.isShown ? (cell.isMine ? BOMB : cell.minesAroundCount) : SPACE
            const flagContent = cell.isMarked ? MARK : ''
            strHTML += `<div class="cell" 
                onclick="onCellClicked(${i}, ${j})" 
                oncontextmenu="onCellRightClicked(this, ${i}, ${j}); return false">${cellValue}${flagContent}</div>`
            strHTML += '</td>'
        }
        strHTML += '</table>'
    }
    updateBombCount()
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
    return strHTML
}
function setMinesNegsCount(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine) count++
        }
    }
    return count
}
function placeMines(bombs, rows, cols) {
    const positions = []
    while (positions.length < bombs) {
        const randomRow = Math.floor(Math.random() * rows)
        const randomCol = Math.floor(Math.random() * cols)
        positions.push({ row: randomRow, col: randomCol })
    }
    return positions
}

function onCellClicked(row, col) {
    const cell = gBoard[row][col]

    // if (!gGame.isOn) {

    //     gGame.isOn = true
    //     startTimer()
    // }

    if (cell.isShown) {
        return
    }

    if (cell.isMarked) {

        return
    }

    if (cell.isMine) {
        revealAllMines()
        stopTimer()
        console.log('Game Over!')
    } else {
        revealCell(row, col)

        if (cell.minesAroundCount === 0) {
            revealZeroCells(row, col)
        }
    }
}

function onCellRightClicked(elCell, row, col) {

    elCell.addEventListener('contextmenu', function (event) {
        event.preventDefault()
    })

    const cell = gBoard[row][col]

    if (!cell.isShown) {
        cell.isMarked = !cell.isMarked
        elCell.innerHTML = cell.isMarked ? MARK : ''
        updateBombCount()
    }
}

function revealCell(row, col) {

    const cell = gBoard[row][col]

    if (cell.isShown) {
        return
    }

    cell.isShown = true

    if (!cell.isMine) {

        cell.minesAroundCount = setMinesNegsCount(gBoard, row, col)
    }

    renderBoard(gBoard)
}

function revealZeroCells(row, col, depth = 0, maxDepth = 3) {

    if (depth > maxDepth) {
        return
    }
    for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
            if (i < 0 || i >= gBoard.length || j < 0 || j >= gBoard[0].length) {
                continue
            }
            const cell = gBoard[i][j]

            if (!cell.isShown && cell.minesAroundCount === 0 && !cell.isMine) {
                revealCell(i, j)
                revealZeroCells(i, j, depth + 1, maxDepth)
            } else if (!cell.isMine && cell.minesAroundCount > 0) {
                revealCell(i, j)
            }
        }
    }
}

function revealAllMines() {
    gBoard.forEach(row => {
        row.forEach(cell => {
            if (cell.isMine) {
                cell.isShown = true
            }
        })
    })

    renderBoard(gBoard)
}



function updateBombCount() {
    var elBombCount = document.getElementById('bombCount')
    elBombCount.textContent = 'Mines: ' + remainingMines
}

document.querySelector('.panel').addEventListener('click', function (event) {
    if (event.target.classList.contains('difficulty')) {
        setDifficulty(event.target.innerText.toLowerCase())
    }
})

function setDifficulty(difficulty) {

    if (difficulty === 'easy') {
        gLevel.SIZE = originalLevel.SIZE
        gLevel.BOMB = originalLevel.BOMB
    } else if (difficulty === 'medium') {
        gLevel.SIZE = originalLevel.SIZE * 2
        gLevel.BOMB = originalLevel.BOMB * 4
    } else if (difficulty === 'hard') {
        gLevel.SIZE = originalLevel.SIZE * 4
        gLevel.BOMB = originalLevel.BOMB * 8
    } else {
        gLevel.SIZE = originalLevel.SIZE
        gLevel.BOMB = originalLevel.BOMB
    }

    onInit()
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
