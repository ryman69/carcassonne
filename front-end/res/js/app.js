var info = new Object();
info.tileSize = 100;
info.scale = 1;
info.scaleMultiplyer = 0.8;
info.darwOffset = {};


//Funciton that initias the game, and does all the initial set up.
function startGameApp() {
    //Create game on server
    createGame();

    //Add canvas and context to the game information object
    info.canvas = document.getElementById('game-board');
    info.ctx = info.canvas.getContext('2d');


    /*Initialise the width and height of the canvas based on window size and add a window resize listent to update it. */
    updateInfo();
    window.addEventListener('resize', updateInfo);

    //Draw an initial grid. This is a tester method
    speed(drawGrid);
    displayNextTile(getNextTile());
    speed(drawBaord);
//    window.addEventListener('resize', drawGrid);
    window.addEventListener('resize', drawBaord);

    //Zooming listeners
    $('#plus').click(function () {
        info.tileSize /= info.scaleMultiplyer;
        //        drawGrid();
        speed(drawGrid);
    });

    $('#minus').click(function () {
        info.tileSize *= info.scaleMultiplyer;
        //        drawGrid();
        speed(drawGrid);
    });

    $('#recentre').click(function () {
        info.tileSize = 100;
        drawGrid();
    });

    //Click listeners
    $('#game-board').click(function (evt) {
        var test = getBoardPosFromMouse(info.canvas, evt);
        console.log("this tile is at pos: " + JSON.stringify(test));
        fillBoardTile(test.x, test.y);

    });

    //initial rotation of tile
    rotate('new-tile', 0);

    //    console.log(getBoard());
    //    console.log(getNextTile());
    //    console.log(placeTile());
}

// Update the game info object with the window height and width.
function updateInfo() {
    info.windW = document.getElementById("game-board").width;
    info.windH = document.getElementById("game-board").height;
}

//rotates the element by 'id' by a give degree
function rotate(id, deg) {
    if (deg != 0) {
        var currentDeg = getAngle(id);
        deg += currentDeg;
    }
    document.getElementById(id).style.WebkitTransform = "rotate(" + deg + "deg)";
    document.getElementById(id).style.msTransform = "rotate(" + deg + "deg)";
    document.getElementById(id).style.transform = "rotate(" + deg + "deg)";
}

//Get the angle of rotation of the element 'id' transformation style.
function getAngle(id) {
    var cssElmt = document.getElementById(id).style.transform;
    var a = cssElmt.indexOf('(') + 1;
    var b = cssElmt.indexOf('d');
    var angle = parseInt(cssElmt.slice(a, b));
    if (angle === 360 || angle === -360) angle = 0;
    return angle;
}

function getBoardPosFromMouse(cvs, evt) {
    //set up the board position, the return object
    var bPos = {};
    var mPos = getMousePos(cvs, evt);
    var t = info.tileSize;
//    console.log(mPos);
    var offset = info.darwOffset;
//    console.log("This is the new offset: "+offset)
    //if mPos is (54, 53) then the bPos is (5, 5);
//    bPos.x = Math.floor((mPos.x / t)-(t-offset.x));
//    bPos.y = Math.floor((mPos.y / t)-(t-offset.y));
//    bPos.x = Math.floor((mPos.x-offset.x) / t);
//    bPos.y = Math.floor((mPos.y-offset.y) / t);
    bPos.x = Math.floor((mPos.x / info.tileSize));
    bPos.y = Math.floor((mPos.y / info.tileSize));

    console.log("the mpos.x is: "+mPos.x);
    console.log("The tilesie is: "+t);
    console.log("The mpos.x/t = "+mPos.x/t);
    console.log("the floor(mpos.x/t) = " +Math.floor(mPos/t));

//    console.log(bPos);
    return bPos;
}

function getMousePos(cvs, evt) {
    var rect = cvs.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

/*
magic code that centers the grid!
c.save();
c.translate(info.windW / 2 - info.tileSize / 2, info.windH / 2 - info.tileSize / 2);
c.strokeRect(info.tileSize * gridX, info.tileSize * gridY, info.tileSize, info.tileSize);
c.restore();
*/

// not quite woring yet.
function drawBaord() {
    var board = getBoard();
    //    var boardSize = board.length;
    var boardSize = 40;
    var c = info.ctx;
    //set tile size
    info.tileSize = info.windW / boardSize;
    var t = info.tileSize;
    //set drawOffset to draw from centre.
    info.darwOffset.x = (info.windW / 2 - t / 2) % t;
    info.darwOffset.y = (info.windH / 2 - t / 2) % t;

    c.clearRect(0, 0, info.windW, info.windH);
    c.strokeStyle = "black";

    /* //DRAW SO THE CENTRE TILE IS IN THE CENTRE
    for (var gridX = ~(boardSize / 2); gridX < boardSize; gridX++) {
        for (var gridY = ~(boardSize / 2); gridY < boardSize; gridY++) {
            c.save();
            c.translate(boardSize / 2 - info.tileSize / 2, boardSize / 2 - info.tileSize / 2);
            c.strokeRect(info.tileSize * gridX, info.tileSize * gridY, info.tileSize, info.tileSize);
            c.restore();
        }
    }*/
    //DRAW SO THE 1ST TILE IS IN THE TOP RIGHT
    for (var gridX = 0; gridX < boardSize; gridX++) {
        for (var gridY = 0; gridY < boardSize; gridY++) {
            c.save();
            c.strokeRect(t * gridX, t * gridY, t, t);
            c.restore();
        }
    }

}

function displayNextTile(tile) {
    var name = tile.name;
    var path = 'res/pics/tiles/original-game/';
    var src = path+name+'.png';
    console.log($('#new-tile').attr('src'));
    console.log(src);
    $('#new-tile').attr('src', src);
    console.log($('#new-tile').attr('src'));
}


////////////////////////////////////////////////////////
//SERVER CALLS                                        //
////////////////////////////////////////////////////////


//Create Game, need to pass in the an object with the player names
function createGame() {
    var players = {};
    players.players = ["Ryan", "Guillaume"];
    var xhr = new XMLHttpRequest();
    var url = "http://localhost:3000/v2/creategame";
    xhr.open("post", url, false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(players));
    console.log(xhr.responseText);
    return xhr.responseText;
}

//gets the board from the server
function getBoard() {
    var xhr = new XMLHttpRequest();
    var url = "http://localhost:3000/v2/getboard"
    xhr.open("get", url, false);
    xhr.send();

    //        console.log(xhr.responseText);
    return JSON.parse(xhr.responseText);
}

//get the next tile from the server
function getNextTile() {
    var xhr = new XMLHttpRequest();
    xhr.open("get", "http://localhost:3000/v2/generate", false);
    xhr.send();

    console.log(JSON.parse(xhr.responseText));
    return JSON.parse(xhr.responseText);
}

//sends the tile placement location to the server
function placeTile(tile) {
    var xhr = new XMLHttpRequest();
    xhr.open("post", "http://localhost:3000/v2/placetile", false);
    xhr.send(tile);

    return JSON.parse(xhr.responseText);
}

//Helper function. Time it takes to run a function
function speed(fnc) {
    var d1 = new Date();
    fnc();
    var d2 = new Date();
    console.log(d2.getTime() - d1.getTime());
    return d2.getTime() - d1.getTime();
}

////////////////////////////////////////////////////////
//Test functions to help development                  //
////////////////////////////////////////////////////////

// Tester function to draw a grid
function drawGrid() {
    //draw the grid based on window size
    var c = info.ctx;
    c.clearRect(0, 0, info.windW, info.windH);
    c.strokeStyle = "black";

    var gridWidth = info.windW / info.tileSize;
    var gridHeight = info.windH / info.tileSize;

    for (var gridX = ~(gridWidth / 2); gridX < gridWidth; gridX++) {
        for (var gridY = ~(gridHeight / 2); gridY < gridHeight; gridY++) {
            c.save();
            c.translate(info.windW / 2 - info.tileSize / 2, info.windH / 2 - info.tileSize / 2);
            c.scale(info.scale, info.scale);
            c.strokeRect(info.tileSize * gridX, info.tileSize * gridY, info.tileSize, info.tileSize);
            c.restore();

        }
    }
    drawCentre();
}

//tester function to draw a square in the middle of the screen
function drawCentre() {
    var c = info.ctx;
    var horCen = info.windW / 2;
    var verCen = info.windH / 2;
    var tileWidthCen = info.tileSize / 2;
    var tileHeightCen = info.tileSize / 2;
    c.strokeStyle = "red";
    c.strokeRect(horCen - tileWidthCen, verCen - tileHeightCen, info.tileSize, info.tileSize);
}

//tester function that draws on a given board pos
function fillBoardTile(bx, by) {
    var c = info.ctx;
    var t = info.tileSize;
    //translate to account for tile centering
    var centreDrawPoint = {};
    centreDrawPoint.x = info.windW / 2 - info.tileSize / 2;
    centreDrawPoint.y = info.windH / 2 - info.tileSize / 2;
    var offset = {};
    offset.x = centreDrawPoint.x % t;
    offset.y = centreDrawPoint.y % t;
//    console.log("this is the offset: " + JSON.stringify(offset));
//    console.log("the draw point x is: " + bx);
//    console.log("the tile size is: " + t);
    c.save();
    //    c.translate(t-offset.x, t-offset.y);
    c.fillStyle = "blue";
    //    c.fillRect(t-offset.x+(bx * t), by * t, t, t);
    c.fillRect(bx * t, by * t, t, t);
    c.restore();
}
