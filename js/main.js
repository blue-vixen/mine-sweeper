'use strict';

const MINE_IMG = '💣';
const FLAG_IMG = '🚩'
const START_IMG = '😄';
const LOSE_IMG = '🤯';
const WIN_IMG = '😎';
const LIFE_IMG = '❤'

var g7BoomOn = false;
var gGameHistory = [];
var gBoard;
var gLocalStorage;
var gIntervalTimer;
var gHintTimeout;
var gPositions = [];
var gVictory = false;
var gLevel = {
    size: 4,
    mines: 2,
    name: 'beginner'
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 0,
    minesLeft: gLevel.mines,
    hints: 0,
    safeClicks: 3
}

var gHintOn = false;

console.log(localStorage.beginner, localStorage.medium, localStorage.expert)

function init() {
    gGameHistory = [];
    gGame.minesLeft = gLevel.mines;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gHintOn = false;
    gGame.lives = (gLevel.size === 4) ? 1 : 3;
    gGame.safeClicks = (gLevel.size === 4) ? 1 : 3;
    gPositions = [];
    gBoard = buildBoard();
    if (g7BoomOn) update7BoomBoard();
    gVictory = false;
    renderBoard(gBoard);
    if (gLevel.size > 4) document.querySelector(`.hints`).style.visibility = "visible";
    document.querySelector(".game-status").innerText = START_IMG;
    gGame.isOn = true;
    document.querySelector(".count span").innerText = gGame.minesLeft;
    document.querySelector(".safe-btn span").innerHTML = `${gGame.safeClicks} Left`

    for (var i = 0; i < gGame.lives; i++) {
        document.querySelector(`.life${i + 1}`).style.color = "red";
        document.querySelector(`.life${i + 1}`).style.textShadow = "0 0 5px #f3eded, 0 0 15px #f700ff";
        document.querySelector(`.hint${i + 1}`).style.textShadow = "0 0 5px #f3eded, 0 0 15px #ffd900";
        document.querySelector(`.hint${i + 1}`).style.visibility = 'visible';
    }

    document.querySelector(`.beginner span`).innerHTML = localStorage.getItem('beginner');
    document.querySelector(`.medium span`).innerHTML = localStorage.getItem('medium');
    document.querySelector(`.expert span`).innerHTML = localStorage.getItem('expert');




}

function setLevel(value) {
    gLevel.name = value;
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
    for (var i = 0; i < 3; i++) {
        document.querySelector(`.life${i + 1}`).style.color = "lightgray";
        document.querySelector(`.hint${i + 1}`).style.visibility = 'hidden';

    }
    init();
}


function hintClicked(elHint) {
    if (gGame.shownCount === 0 && gGame.markedCount === 0) return
    // console.log('Eureka!');
    gHintOn = true;
    elHint.style.visibility = 'hidden';

}

function restartGame() {
    console.log('Restarting');
    stopTimer()
    gIntervalTimer = null;
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

function sevenBoomClicked() {
    g7BoomOn = !g7BoomOn
    restartGame();
}


function update7BoomBoard() {
    // console.log(gPositions);
    for (var i = 0; i < gPositions.length; i++) {
        if (i % 7 === 0 || i.toString().indexOf('7') !== -1) {
            var currPos = gPositions[i];
            gBoard[currPos.i][currPos.j].isMine = true;
        }
    }
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
    document.querySelector('.safe-btn').classList.remove('btn-off');
    updateBoard();

}

function updateBoard() {
    if (g7BoomOn) return
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
    // console.log(gBoard);
}

function renderBoard(board) {
    console.log(board);
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[i].length; j++) {
            var cellContent;
            var currCell = board[i][j];
            // console.log('Curr Cell:', currCell, 'i:', i, 'j:', j);
            var cellClass = getClassName({ i: i, j: j });
            cellClass += (currCell.isShown) ? ' visible ' : ' hidden ';
            var spanClass = (currCell.isShown) ? 'shown' : ' hidden ';
            // cellClass += (currCell.isMine ? ' mine ' : '');
            if (currCell.isMine) cellContent = MINE_IMG
            else if (currCell.minesAroundCount > 0) cellContent = currCell.minesAroundCount;
            else cellContent = '';
            strHTML += `\t<td class ="cell ${cellClass}" title="${i}-${j}" data-i="${i}" data-j="${j}" onclick="cellClicked(${i},${j})" onclick="cellMarked(this)"><span class="${spanClass}">${cellContent}</span>\n`
            // strHTML += (currCell.isMine) ? MINE_IMG : '';
            // if (currCell.isMine) strHTML += MINE_IMG
            // else if (currCell.minesAroundCount > 0) strHTML += `${currCell.minesAroundCount}`;

            strHTML += '\t</td>\n';

        }
        strHTML += '</tr>\n';
    }
    // console.log(strHTML);
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
    if (gHintOn) {
        showHintCells(gBoard, cellI, cellJ)
        return;
    }
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

    if (gBoard[cellI][cellJ].isMine) {
        mineClicked(cellI, cellJ);
    } else if (gBoard[cellI][cellJ].minesAroundCount === 0) {
        // gGame.shownCount++
        expandShown(gBoard, cellI, cellJ)
        gBoard[cellI][cellJ].isShown = true;
    } else {
        // gGame.shownCount++
        gBoard[cellI][cellJ].isShown = true;
    }
    gGameHistory.push(gBoard.slice());
    console.log(gGameHistory);

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
            if (currCell.isShown || currCell.isMarked) continue
            // console.log(`current cell pos: ${i},${j}`);
            //update model
            mat[i][j].isShown = true;
            // gGame.shownCount++
            // debugger
            // var shownCountCheck = gGame.shownCount;
            // console.log(gGame.shownCount);
            //render cell
            document.querySelector(`.cell-${i}-${j} span`).style.visibility = 'visible';
            document.querySelector(`.cell-${i}-${j}`).classList.add('visible');


            if (gBoard[i][j].minesAroundCount === 0) expandShown(gBoard, i, j); //Recursion
        }
    }
    // console.log('Expanded!');
}

function cellMarked(elCell) {
    if (gGame.shownCount === 0 && gGame.markedCount === 0) return; //Can't place a flag on the first click.
    if (gBoard[elCell.dataset.i][elCell.dataset.j].isShown || !gGame.isOn) return;
    var elCellSpan = document.querySelector(`.cell-${elCell.dataset.i}-${elCell.dataset.j}`)
    // console.log(elCellSpan);
    if (!gBoard[elCell.dataset.i][elCell.dataset.j].isMarked) {
        gBoard[elCell.dataset.i][elCell.dataset.j].isMarked = true;
        elCellSpan.innerText = FLAG_IMG;
        elCellSpan.style.visibility = 'visible';
        gGame.minesLeft--
        // gGame.markedCount++
        // console.log(gGame.markedCount);
        // debugger
    } else {
        var strHTML = '<span style="visibilty:hidden">'
        gBoard[elCell.dataset.i][elCell.dataset.j].isMarked = false;
        if (gBoard[elCell.dataset.i][elCell.dataset.j].isMine) strHTML += MINE_IMG;
        else if (gBoard[elCell.dataset.i][elCell.dataset.j] > 0) strHTML += gBoard[cellI][cellJ].minesAroundCount;
        else strHTML += '';
        elCellSpan.innerHTML = strHTML + '</span>';
        // gGame.markedCount--
        gGame.minesLeft++
        // console.log(gGame.markedCount);
    }
    document.querySelector(".count span").innerText = gGame.minesLeft;
    checkGameOver();
}

window.addEventListener('contextmenu', function (e) {

    if (e.target.nodeName === 'TD' || e.target.nodeName === 'SPAN') {
        e.preventDefault();
        cellMarked(e.target)
    }

}, false);

function mineClicked(cellI, cellJ) {
    if (gBoard[cellI][cellJ].isShown || gBoard[cellI][cellJ].isMarked) return;
    if (gGame.lives > 0) {
        // console.log('OOOPS!!!');
        document.querySelector(`.life${gGame.lives}`).style.color = 'lightgray';
        document.querySelector(`.life${gGame.lives}`).style.textShadow = 'none';
        gGame.lives--
        gGame.minesLeft--
        // gGame.markedCount++
        gBoard[cellI][cellJ].isMarked = true;
        document.querySelector(".count span").innerText = gGame.minesLeft;
        checkGameOver();
    } else {
        revealAllMines();
        gameOver();

    }
    // console.log(gGame.Lives);
}

function checkGameOver() {
    gGame.markedCount = 0;
    gGame.shownCount = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMarked) gGame.markedCount++
            if (gBoard[i][j].isShown) gGame.shownCount++
        }
    }

    console.log('marked:', gGame.markedCount, 'shown:', gGame.shownCount);
    if (gGame.markedCount === gLevel.mines && gGame.shownCount === Math.pow(gLevel.size, 2) - gLevel.mines) {
        gVictory = true;
        gameOver();
        // console.log(gGame.secsPassed);
        // debugger
        if (gLocalStorage) {
            switch (gLevel.name) {
                case 'beginner':
                    if (!localStorage.beginner) localStorage.beginner = gGame.secsPassed
                    else if (gGame.secsPassed < localStorage.beginner) localStorage.beginner = gGame.secsPassed;
                    // console.log(localStorage.beginner)
                    break;
                case 'medium':
                    if (!localStorage.medium) localStorage.medium = gGame.secsPassed
                    else if (gGame.secsPassed < localStorage.medium) localStorage.medium = gGame.secsPassed;
                    // console.log(localStorage.medium)
                    break;
                case 'expert':
                    if (!localStorage.expert) localStorage.expert = gGame.secsPassed
                    else if (gGame.secsPassed < localStorage.expert) localStorage.expert = gGame.secsPassed;
                    // console.log(localStorage.expert)
                    break;
            }
            document.querySelector(`.${gLevel.name} span`).innerHTML = localStorage.getItem(`${gLevel.name}`);
            // console.log(localStorage.beginner)
        }

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
            if (gBoard[i][j].isMine) {
                // gBoard[i][j].isShown = true;
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

    gIntervalTimer = setInterval(function () {
        var timeNow = Date.now()
        gGame.secsPassed = Math.trunc((timeNow - startTime) / 1000);
        elTimer.innerText = gGame.secsPassed;
    }, 100);

}

function stopTimer() {
    clearInterval(gIntervalTimer);

}


function showHintCells(mat, cellI, cellJ) {
    console.log('clicked:', cellI, cellJ);

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue; // Solves case of cells placed in the edges.
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue; // Edges.
            document.querySelector(`.cell-${i}-${j} span`).style.visibility = 'visible';
            document.querySelector(`.cell-${i}-${j}`).classList.add('hint-show');
        }
    }
    gHintTimeout = setTimeout(hideHintCells, 1000, mat, cellI, cellJ);
    gHintOn = false;
}

function hideHintCells(mat, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue; // Solves case of cells placed in the edges.
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue; // Edges.
            document.querySelector(`.cell-${i}-${j} span`).style.visibility = 'hidden';
            document.querySelector(`.cell-${i}-${j}`).classList.remove('hint-show');
        }
    }

}


function safeClick() {
    if (gGame.shownCount === 0 && gGame.markedCount === 0) return;
    if (gGame.safeClicks === 0) {
        document.querySelector('.safe-btn').classList.add('btn-off');
        return;
    }
    console.log('safe click!');
    var safeCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
                safeCells.push({ i: i, j: j })
            }
        }
    }
    // console.log(safeCells.length);
    var randIdx = getRandomInt(0, safeCells.length);
    var randCell = safeCells.splice(randIdx, 1);
    randCell = randCell[0];
    // console.log(randCell);
    var elCell = document.querySelector(`.cell-${randCell.i}-${randCell.j}`)
    elCell.classList.add('safe-click');
    gGame.safeClicks--
    document.querySelector(".safe-btn span").innerHTML = `${gGame.safeClicks} Left`
    setTimeout(function () { elCell.classList.remove('safe-click') }, 2000);

}

// function undo() {
//     if (!gGameHistory.length) return;
//     console.log(gGameHistory.length);
//     var currBoard = gGameHistory.pop();
//     console.log(gGameHistory.length);
//     console.log(currBoard);
//     // console.log('idx:', gGameHistory.length - 1, gGameHistory[gGameHistory.length - 1]);
//     // console.log(gGameHistory);
//     renderBoard(currBoard);

// }

if (typeof (Storage) !== "undefined") {
    gLocalStorage = true;

} else {
    gLocalStorage = false;
}


