'use strict';

const MINE_IMG = '💣';
const FLAG_IMG = '🚩'
const START_IMG = '😄';
const LOSE_IMG = '🤯';
const WIN_IMG = '😎';

var gBoard;
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
    secsPassed: 0
}



function init() {
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gPositions = [];
    gBoard = buildBoard(4);
    gVictory = false;
    renderBoard(gBoard);
    document.querySelector(".game-status").innerText = START_IMG;
    gGame.isOn = true;


}

function restartGame() {
    console.log('Restarting');
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

    //Randomly choosing a position from gPositions and placing a mine.
    for (i = 1; i <= gLevel.mines; i++) {
        var randIdx = getRandomInt(0, gPositions.length);
        var randPos = gPositions.splice(randIdx, 1);
        // console.log(randPos[0]);

        // console.log('gpositions after splice:', gPositions);
        board[randPos[0].i][randPos[0].j].isMine = true;
        console.log(`placed a mine at: ${randPos[0].i},${randPos[0].j}`);
    }

    //Counting mines around each cell and storing them in the model.

    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(i, j, board);
        }
    }
    // console.table(board);

    return board;
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j];
            // console.log('Curr Cell:', currCell, 'i:', i, 'j:', j);
            var cellClass = getClassName({ i: i, j: j });

            // cellClass += (currCell.isShown) ? ' shown ' : 'hidden';
            cellClass += (currCell.isMine ? ' mine ' : '');

            strHTML += `\t<td class ="cell ${cellClass}" title="${i}-${j}" data-i="${i}" data-j="${j}" onclick="cellClicked(this, ${i},${j})" onclick="cellMarked(this)">\n`
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

function cellClicked(elCell, cellI, cellJ) {
    if (!gGame.isOn || gBoard[cellI][cellJ].isMarked || gBoard[cellI][cellJ].isShown) return;
    if (gBoard[cellI][cellJ].isMine) {
        mineClicked(elCell, cellI, cellJ)
    } else if (gBoard[cellI][cellJ].minesAroundCount > 0) {
        elCell.innerHTML = `${gBoard[cellI][cellJ].minesAroundCount}`
        gBoard[cellI][cellJ].isShown = true;
        gGame.shownCount++
        console.log('occupied cell clicked:', gGame.shownCount);
    } else if (gBoard[cellI][cellJ].minesAroundCount === 0) {//Empty cell
        elCell.style.backgroundColor = "lightblue";
        gBoard[cellI][cellJ].isShown = true;
        gGame.shownCount++
        console.log('empty cell clicked:', gGame.shownCount);
        expandShown(gBoard, cellI, cellJ);

    }
    // console.log(gGame.shownCount);
    checkGameOver();
}

function expandShown(mat, cellI, cellJ) {
    console.log('Expanding...');
    // debugger
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue; // Solves case of cells placed in the edges.
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue; // Edges.
            if (i === cellI && j === cellJ) continue; //Skips the cell itself.
            var currCell = mat[i][j];
            if (currCell.isShown) continue
            console.log(`current cell pos: ${i},${j}`);
            if (mat[i][j].minesAroundCount === 0) {
                //update model
                mat[i][j].isShown = true;
                gGame.shownCount++
                console.log(gGame.shownCount);
                //render board
                document.querySelector(`.cell-${i}-${j}`).style.backgroundColor = "blue";
            } else {
                //update model
                mat[i][j].isShown = true;
                gGame.shownCount++
                console.log(gGame.shownCount);
                //render board
                document.querySelector(`.cell-${i}-${j}`).innerHTML = mat[i][j].minesAroundCount;
            }
        }
    }
    console.log('Expanded!');
}

function cellMarked(elCell) {
    if (gBoard[elCell.dataset.i][elCell.dataset.j].isShown || !gGame.isOn) return;
    if (!gBoard[elCell.dataset.i][elCell.dataset.j].isMarked) {
        gBoard[elCell.dataset.i][elCell.dataset.j].isMarked = true;
        elCell.innerHTML = FLAG_IMG;
        gGame.markedCount++
        console.log(gGame.markedCount);
    } else {
        gBoard[elCell.dataset.i][elCell.dataset.j].isMarked = false;
        elCell.innerHTML = '';
        gGame.markedCount--
        // console.log(gGame.markedCount);
    }
    checkGameOver();
}

window.addEventListener('contextmenu', function (e) {
    if (e.target.nodeName === 'TD') {
        e.preventDefault();
        cellMarked(e.target)
    }

}, false);

function mineClicked(elCell, cellI, cellJ) {
    if (gBoard[cellI][cellJ].isShown) return;
    console.log('OOOPS!!!');
    elCell.innerHTML = MINE_IMG;
    revealAllMines();
    gameOver();
}

function checkGameOver() {
    console.log('marked:', gGame.markedCount, 'shown:', gGame.shownCount);
    if (gGame.markedCount === gLevel.mines && gGame.shownCount === Math.pow(gLevel.size, 2) - gLevel.mines) {
        gVictory = true;
        gameOver();
    }
}


function gameOver() {
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
    console.log('All mines revealed.')
}