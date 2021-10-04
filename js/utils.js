function printMat(mat, selector) {
    var strHTML = '';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            var className = 'cell cell' + i + '-' + j;
            // console.log('Class name:', className)
            var className = `cell cell${i}-${j}`;
            // strHTML += '<td class="' + className + '"> ' + cell + ' </td>'
            // console.log(strHTML);
            strHTML += `<td class="${className}"> ${cell}</td>`
        }
        strHTML += '</tr>'
    }
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}


// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

