'use strict';

const MINE_IMG = '💣';
const FLAG_IMG = '🚩'
const START_IMG = '😄';
const LOSE_IMG = '🤯';
const WIN_IMG = '😎';
const LIFE_IMG = '❤'

var gBoard;
var gInterval;
var gPositions = [];
var gVictory = false;
var gLevel = {
    size: 4,
    mines: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    Lives: 0,
    minesLeft: gLevel.mines
}



function init() {
    gGame.minesLeft = gLevel.mines;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.Lives = (gLevel.size === 4) ? 1 : 3;
    gPositions = [];
    gBoard = buildBoard();
    gVictory = false;
    renderBoard(gBoard);
    document.querySelector(".game-status").innerText = START_IMG;
    gGame.isOn = true;
    document.querySelector(".count span").innerText = gGame.minesLeft;
    for (var i = 0; i < gGame.Lives; i++) {
        document.querySelector(`.life${i + 1}`).style.color = "red";
    }



}

function setLevel(value) {
    // console.log('level clicked:', value);
    restartGame();
    switch (value) {
        case 'beginner':
            gLevel.size = 4;
            gLevel.mines = 2;
            break;
        case 'medium':
            gLevel.size = 8;
            gLevel.mines = 12;
            break;
        case 'expert':
            gLevel.size = 12;
            gLevel.mines = 30;
            break;
    }
    init();
}

function restartGame() {
    console.log('Restarting');
    stopTimer()
    gInterval = null;
    gGame.secsPassed = 0;
    document.querySelector(".timer span").innerHTML = gGame.secsPassed;
    init();
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.size; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            gPositions.push({ i: i, j: j }); // Creating an array of all the positions to choose from randomly as to not choose the same pos twice.
            // console.log(cell);
            board[i][j] = cell;
        }
    }
    //Manually set mines for testing:
    // board[0][3].isMine = true;
    // board[2][1].isMine = true;
    // board[0][3].isShown = true;
    // board[2][1].isShown = true;



    return board;
}

function startGame(cellI, cellJ) {
    console.log('Lets go');
    startTimer();
    //Finding the clicked cell in gPositions array and removing it.
    for (var i = 0; i < gPositions.length; i++) {
        // console.log(gPositions[i]);
        // var clickedIdx = 0;
        if (cellI === gPositions[i].i && cellJ === gPositions[i].j) {
            // clickedIdx = i;
            // console.log('Found index:', clickedIdx);
            gPositions.splice(i, 1);
            // console.log(gPositions.length);

        }
    }
    updateBoard();

}

function updateBoard() {
    //Randomly choosing a position from gPositions and placing a mine.
    for (i = 1; i <= gLevel.mines; i++) {
        var randIdx = getRandomInt(0, gPositions.length);
        var randPos = gPositions.splice(randIdx, 1);
        // console.log(randPos[0]);

        // console.log('gpositions after splice:', gPositions);
        gBoard[randPos[0].i][randPos[0].j].isMine = true;
        console.log(`placed a mine at: ${randPos[0].i},${randPos[0].j}`);
    }

    //Counting mines around each cell and storing them in the model.

    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            gBoard[i][j].minesAroundCount = setMinesNegsCount(i, j, gBoard);
        }
    }

    renderBoard(gBoard);
    // console.log('board updated and rendered');
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[i].length; j++) {
            var cellContent;
            var currCell = board[i][j];
            // console.log('Curr Cell:', currCell, 'i:', i, 'j:', j);
            var cellClass = getClassName({ i: i, j: j });
            // cellClass += (currCell.isShown) ? ' shown ' : 'hidden';
            cellClass += (currCell.isMine ? ' mine ' : '');
            if (currCell.isMine) cellContent = MINE_IMG
            else if (currCell.minesAroundCount > 0) cellContent = currCell.minesAroundCount;
            else cellContent = '';
            strHTML += `\t<td class ="cell ${cellClass}" title="${i}-${j}" data-i="${i}" data-j="${j}" onclick="cellClicked(${i},${j})" onclick="cellMarked(this)"><span>${cellContent}</span>\n`
            // strHTML += (currCell.isMine) ? MINE_IMG : '';
            // if (currCell.isMine) strHTML += MINE_IMG
            // else if (currCell.minesAroundCount > 0) strHTML += `${currCell.minesAroundCount}`;

            strHTML += '\t</td>\n';

        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;

}


function setMinesNegsCount(cellI, cellJ, mat) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue; // Solves case of cells placed in the edges.
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue; // Edges.
            if (i === cellI && j === cellJ) continue; //Skips the cell itself.
            if (mat[i][j].isMine) neighborsCount++
        }
    }
    return neighborsCount;
}

function cellClicked(cellI, cellJ) {
    if (!gGame.isOn || gBoard[cellI][cellJ].isMarked || gBoard[cellI][cellJ].isShown) return;
    if (gGame.shownCount === 0 && gGame.markedCount === 0) {
        // console.log('First click...')
        startGame(cellI, cellJ);
    }
    var elCellSpan = document.querySelector(`.cell-${cellI}-${cellJ} span`);
    // console.log(elCellSpan);
    var elCell = document.querySelector(`.cell-${cellI}-${cellJ}`);
    elCell.classList.add('visible');
    // console.log(elCell);
    elCellSpan.style.visibility = 'visible';
    gGame.shownCount++
    if (gBoard[cellI][cellJ].isMine) {
        mineClicked(cellI, cellJ);
    } else if (gBoard[cellI][cellJ].minesAroundCount === 0) {
        expandShown(gBoard, cellI, cellJ)
    }
    gBoard[cellI][cellJ].isShown = true;
    checkGameOver();
}

function expandShown(mat, cellI, cellJ) {
    // console.log('Expanding...');
    // debugger
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue; // Solves case of cells placed in the edges.
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue; // Edges.
            if (i === cellI && j === cellJ) continue; //Skips the cell itself.
            var currCell = mat[i][j];
            if (currCell.isShown) continue
            // console.log(`current cell pos: ${i},${j}`);
            //update model
            mat[i][j].isShown = true;
            gGame.shownCount++
            // console.log(gGame.shownCount);
            //render cell
            document.querySelector(`.cell-${i}-${j} span`).style.visibility = 'visible';
            document.querySelector(`.cell-${i}-${j}`).classList.add('visible');


        }
    }
    // console.log('Expanded!');
}

function cellMarked(elCell) {
    if (gGame.shownCount === 0 && gGame.markedCount === 0) return;
    if (gBoard[elCell.dataset.i][elCell.dataset.j].isShown || !gGame.isOn) return;
    if (!gBoard[elCell.dataset.i][elCell.dataset.j].isMarked) {
        gBoard[elCell.dataset.i][elCell.dataset.j].isMarked = true;
        elCell.innerHTML = FLAG_IMG;
        gGame.minesLeft--
        gGame.markedCount++
        // console.log(gGame.markedCount);
    } else {
        gBoard[elCell.dataset.i][elCell.dataset.j].isMarked = false;
        elCell.innerHTML = '';
        gGame.markedCount--
        gGame.minesLeft++
        // console.log(gGame.markedCount);
    }
    document.querySelector(".count span").innerText = gGame.minesLeft;
    checkGameOver();
}

window.addEventListener('contextmenu', function (e) {
    if (e.target.nodeName === 'TD') {
        e.preventDefault();
        cellMarked(e.target)
    }

}, false);

function mineClicked(cellI, cellJ) {
    // console.log(gGame.Lives);
    if (gBoard[cellI][cellJ].isShown) return;
    if (gGame.Lives > 0) {
        // console.log('OOOPS!!!');
        document.querySelector(`.life${gGame.Lives}`).style.color = "white";
        gGame.Lives--
    } else {
        revealAllMines();
        gameOver();

    }
    // console.log(gGame.Lives);
}

function checkGameOver() {
    // console.log('marked:', gGame.markedCount, 'shown:', gGame.shownCount);
    if (gGame.markedCount === gLevel.mines && gGame.shownCount === Math.pow(gLevel.size, 2) - gLevel.mines) {
        gVictory = true;
        gameOver();
    }
}


function gameOver() {
    stopTimer();
    var elBtn = document.querySelector(".game-status");
    if (!gVictory) {
        elBtn.innerText = LOSE_IMG;
    } else {
        elBtn.innerText = WIN_IMG;
    }
    gGame.isOn = false;
    // console.log('GAME OVER');
}

function revealAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
                gBoard[i][j].isShown = true;
                document.querySelector(`.cell-${i}-${j}`).innerHTML = MINE_IMG;

            }
        }

    }
    // console.log('All mines revealed.')
}


function startTimer() {
    var startTime = Date.now();
    updateTimer(startTime);
}

function updateTimer(startTime) {
    var elTimer = document.querySelector(".timer span");

    gInterval = setInterval(function () {
        var timeNow = Date.now()
        gGame.secsPassed = Math.trunc((timeNow - startTime) / 1000);
        elTimer.innerText = gGame.secsPassed;
    }, 100);

}

function stopTimer() {
    clearInterval(gInterval);

}