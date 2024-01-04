'use strict'
/////////////////
const MARK = '🚩'
const BOMB = '💣'
const SPACE = ' '
var LIVES = 3
var remainingMines
var gBoard
////////////////
//Message to self: debug
////////////////
var gLevel = {
    SIZE: 4,
    BOMB: 2
}

var gOriginalLevel = {
    SIZE: gLevel.SIZE,
    BOMB: gLevel.BOMB
}

var gGame = {
    isOn: false,
    secsPassed: 0,
    timerInterval: null,
    lives: LIVES
}

function onInit() {
    stopTimer()
    remainingMines = gLevel.BOMB
    gGame.isOn = true
    gGame.lives = LIVES
    gBoard = buildBoard()
    renderBoard(gBoard)
    changeSmiley()
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
            strHTML += '<tr>'
            const cell = board[i][j]
            const cellValue = cell.isShown ? (cell.isMine ? BOMB : cell.minesAroundCount) : SPACE
            const flagContent = cell.isMarked ? MARK : ''
            const backgroundColor = cell.isShown ? 'background-color: lightyellow;' : ''

            strHTML += `<div class="cell" 
                onclick="onCellClicked(${i}, ${j})" 
                oncontextmenu="onCellRightClicked(this, ${i}, ${j}); return false"
                style="${backgroundColor}">${cellValue}${flagContent}</div>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</table>'
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
    if (gGame.lives === 0) {
        return
    }

    const cell = gBoard[row][col]

    if (cell.isShown) {
        return
    }

    if (cell.isMarked) {

        return
    }

    if (cell.isMine) {
        gameResult(false)
    } else {
        revealCell(row, col)

        if (cell.minesAroundCount === 0) {
            revealZeroCells(row, col)
        }
        if (checkWinCondition()) {
            gameResult(true)
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

            if (cell.isShown) {
                continue
            }
            if (cell.isMarked) {
                continue
            }

            if (!cell.isShown && cell.minesAroundCount === 0 && !cell.isMine && !cell.isMarked) {
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
    var elBombCount = document.getElementById('bomb-count')
    elBombCount.textContent = 'Mines: ' + remainingMines
}

function gameResult(won) {
    gGame.isOn = false
    if (won) {
        revealAllMines()
        stopTimer()
        console.log('You Won!')
        alert('You Won!')
    } else {
        gGame.lives--
        if (gGame.lives > 0) {
            console.log(`Lives remaining: ${gGame.lives}`)
            alert(`Lives remaining: ${gGame.lives}`)
        } else {
            revealAllMines()
            stopTimer()
            console.log('Game Over!')
            alert('Gane Over!')
        }
        updateLives()
    }
    changeSmiley()
}

function checkWinCondition() {
    const nonMineCells = gBoard.flat().filter(cell => !cell.isMine)
    return nonMineCells.every(cell => cell.isShown)
}

