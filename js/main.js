'use strict';

const MINE_IMG = '💣';
const FLAG_IMG = '🚩'

var gBoard;
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
    gBoard = buildBoard(4);
    renderBoard(gBoard);

    // console.log(setMinesNegsCount(1, 2, gBoard));



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
            // console.log(cell);
            board[i][j] = cell;
        }
    }
    //Manually set mines for testing:
    // board[0][3].isMine = true;
    // board[2][1].isMine = true;
    // board[0][3].isShown = true;
    // board[2][1].isShown = true;

    //randomly placing mine on the board
    for (i = 1; i <= gLevel.mines; i++) {
        board[getRandomInt(0, gLevel.size)][getRandomInt(0, gLevel.size)].isMine = true;
        console.log('placed a mine');
    }

    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(i, j, board);
        }
    }
    console.table(board);

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
    var strHTML = '';
    if (gBoard[cellI][cellJ].isMine) strHTML += MINE_IMG
    else if (gBoard[cellI][cellJ].minesAroundCount > 0) strHTML += `${gBoard[cellI][cellJ].minesAroundCount}`
    else document.querySelector(`.cell-${cellI}-${cellJ}`).style.backgroundColor = "lightblue";
    // console.log(strHTML);
    elCell.innerHTML = strHTML;
    gBoard[cellI][cellJ].isShown = true;
    console.log(gBoard[cellI][cellJ].isShown);
}

function cellMarked(elCell) {
    gBoard[elCell.dataset.i][elCell.dataset.j].isMarked = true;
    elCell.innerHTML = FLAG_IMG;
}

window.addEventListener('contextmenu', function (e) {
    if (e.target.nodeName === 'TD') {
        e.preventDefault();
        cellMarked(e.target)
    }

}, false);