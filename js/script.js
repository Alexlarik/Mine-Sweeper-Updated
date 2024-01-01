'use strict'
/////////////////
const MARK = '🚩'
const BOMB = '💣'
const SPACE = ' '
var LIVES = 3
var remainingMines
var gBoard
////////////////
//Message to self: fix recursion problem, fix flag problem, fix css,implement timer, implement lives,implement difficulty.
////////////////

var gLevel = {
    SIZE: 4,
    BOMB: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function onInit() {
    remainingMines = gLevel.BOMB;
    gBoard = buildBoard()
    renderBoard(gBoard)
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
            board[i][j] = {
                value: isMine ? BOMB : SPACE,
                isMine: isMine,
                isShown: false
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
            strHTML += `<div class="cell" 
                onclick="onCellClicked(${i}, ${j})" 
                oncontextmenu="onCellRightClicked(this, ${i}, ${j}); return false">${cellValue}</div>`
            strHTML += '</td>'
        }
        strHTML += '</table>'
    }
    updateBombCount()
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
    return strHTML
}

function onCellClicked(row, col) {
    const cell = gBoard[row][col]

    if (cell.isShown) return

    if (cell.isMine) {
        console.log('Game Over!')
        revealAllMines()
    } else {
        revealCell(row, col)
    }
}

function onCellRightClicked(elCell, row, col) {

    elCell.addEventListener('contextmenu', function (event) {
        event.preventDefault()
    })

    const cell = gBoard[row][col]

    if (!cell.isShown) {
        cell.isMarked = !cell.isMarked;
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

function updateBombCount() {
    var elBombCount = document.getElementById('bombCount')
    elBombCount.textContent = 'Mines: ' + remainingMines
}