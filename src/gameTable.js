let gameData = {
    width: 0,
    height: 0,
    dimensions: [8, 10],
    pixelSize: 45,
    fontSize: '25px',
    difficulty: document.getElementById('difficulty').value,
    boardTitle: document.getElementById('board__title'),
    boardGrid: document.getElementById('board__grid'),
    boardDiv: document.getElementById('board'),
    numberOfMines: 10,
    mineLocations: [],
    board: [],
    leftButton: false,
    rightButton: false,
    lose: false,
    win: false,
    seconds: 0,
    stopwatch: null,
    stopwatchStarted: false,
    stopwatchSpanSeconds: document.getElementById('stopwatch_seconds'),
    flagsRemainingElement: document.getElementById('flags_left_number'),
    boardRect: null,
    boundingRect: {}
};

let showInputText = (value) => {
    let id = document.getElementById('showInputText');
    id.innerText = value;
    id.style.fontSize = '20px';
};

// gameData.boundingRect = {
//     left: gameData.boardRect.x + x,
//     right: gameData.boardRect.x + x + gameData.pixelSize,
//     top: gameData.boardRect.y + y - 60,
//     bottom: gameData.boardRect.y + y + gameData.pixelSize - 60
// }

class block {
    constructor(x, y, width, height, color) {
        this.column = x;
        this.row = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.altColor = color === '#A2D149' ? '#E5C29E' : '#D6B899';
        // this.hoverClass = color === '#3DB3FF' ? 'hover_light' : 'hover_dark';
        this.isMine = false;
        this.hasFlag = false;
        this.hasNumber = false;
        this.blockNumber = null;
        this.isRevealed = false;
        this.isBlankBlock = false;
        this.revealBag = [];
        this.adjBlocks = [];
        this.coordinates = [y, x]; // used to track the grid coordinates
        this.minesTouching = []; // when i'm creating mines just do a .push([row, column]) of where that mine is.
        // then from there i can figure out how many i have and turn myself into that number.
        // then from the number i can work out the color i'll turn once i've been clicked.
    }
}

let updateData = () => {
    gameData.difficulty = document.getElementById('difficulty').value;
    // gameData.boardTitle = document.getElementById('board__title');
    gameData.seconds = 0;
    gameData.mineLocations = [];
    gameData.stopwatchSpanSeconds.textContent = '000';
    gameData.boardGrid = document.getElementById('board__grid');
    gameData.boardGrid.style.pointerEvents = 'all';
    gameData.boardTitle.style.pointerEvents = 'all';
    let lostDiv = document.getElementById('lost_game');
    lostDiv.style.display = 'none';
    let wonDiv = document.getElementById('won_game');
    wonDiv.style.display = 'none';
    gameData.lose = false;
    gameData.won = false;
};

let theGrid = () => {
    let win_audio = document.getElementById('ff_win_audio');
    let lose_audio = document.getElementById('ff_lose_audio');
    if (win_audio) document.body.removeChild(win_audio);
    if (lose_audio) document.body.removeChild(lose_audio);
    updateData();

    if (gameData.difficulty === 'easy') {
        gameData.width = 450;
        gameData.height = 360;
        gameData.boardTitle.className = 'board__title easy';
        gameData.boardGrid.className = 'board__grid easy';
        gameData.pixelSize = 45;
        gameData.dimensions = [8, 10];
        gameData.numberOfMines = 10;
        gameData.fontSize = '25px';
        gameData.flagsRemainingElement.innerText = 10;

    } else if (gameData.difficulty === 'medium') {
        gameData.width = 540;
        gameData.height = 420;
        gameData.boardTitle.className = 'board__title medium';
        gameData.boardGrid.className = 'board__grid medium';
        gameData.pixelSize = 30;
        gameData.dimensions = [14, 18];
        gameData.numberOfMines = 40;
        gameData.fontSize = '18.75px';
        gameData.flagsRemainingElement.innerText = 40;

    } else if (gameData.difficulty === 'hard') {
        gameData.width = 600;
        gameData.height = 500;
        gameData.boardTitle.className = 'board__title hard';
        gameData.boardGrid.className = 'board__grid hard';
        gameData.pixelSize = 25;
        gameData.dimensions = [20, 24];
        gameData.numberOfMines = 99;
        gameData.fontSize = '16px';
        gameData.flagsRemainingElement.innerText = 99;

    }

    setTable(gameData.height, gameData.width);
};

// part of my view
let setTable = (rows, columns) => {
    // first remove the old table if it exists
    let oldTable = document.getElementById('grid__table');
    for (let i = 0; i < gameData.boardGrid.childNodes.length; i++) {
        if (oldTable === gameData.boardGrid.childNodes[i]) {
            gameData.boardGrid.removeChild(oldTable);
        }
    }

    let clickRow = document.getElementById('clickLocationRow');
    clickRow.innerHTML = '';
    let clickCol = document.getElementById('clickLocationCol');
    clickCol.innerHTML = '';
    // next lets create the table again, but with the proper dimensions
    let color = '';
    let table = document.createElement('table');

    table.style.width = `${columns}px`;
    table.style.maxWidth = `${columns}px`;
    table.style.minWidth = `${columns}px`;
    table.style.height = `${rows}px`;
    table.style.maxHeight = `${rows}px`;
    table.style.minHeight = `${rows}px`;
    table.style.borderCollapse = 'collapse';
    table.style.margin = '0 auto 50px auto';
    table.style.padding = '0';
    table.style.borderSpacing = '0';
    table.id = 'grid__table';

    // todo - add an alternate image to each td so when you lose it starts having them explode
    for (let i = 0, row = 0; i < gameData.dimensions[0] * gameData.pixelSize; i += gameData.pixelSize, row++) {
        gameData.board[row] = [];
        let tr = document.createElement('tr');
        tr.style.width = `${columns}px`;
        tr.style.maxWidth = `${columns}px`;
        tr.style.minWidth = `${columns}px`;
        tr.style.height = `${gameData.pixelSize}px`;
        tr.style.maxHeight = `${gameData.pixelSize}px`;
        tr.style.minHeight = `${gameData.pixelSize}px`;
        tr.style.padding = '0';
        tr.style.margin = '0';
        tr.id = `${row}`;
        for (let j = 0, column = 0; j < gameData.dimensions[1] * gameData.pixelSize; j += gameData.pixelSize, column++) {
            if (row % 2 === 0 && column % 2 === 0) {
                color = '#AAD651';
            } else if (row % 2 === 0 && column % 2 !== 0) {
                color = '#A2D149';
            } else if (row % 2 !== 0 && column % 2 === 0) {
                color = '#A2D149';//'#3775E8';
            } else if (row % 2 !== 0 && column % 2 !== 0) {
                color = '#AAD651';//'#3DB3FF';
            }
            gameData.board[row][column] = new block(j, i, gameData.pixelSize, gameData.pixelSize, color);
            let td = document.createElement('td');
            td.style.backgroundColor = color;
            td.style.width = `${gameData.pixelSize}px`;
            td.style.maxWidth = `${gameData.pixelSize}px`;
            td.style.minWidth = `${gameData.pixelSize}px`;
            td.style.height = `${gameData.pixelSize}px`;
            td.style.maxHeight = `${gameData.pixelSize}px`;
            td.style.minHeight = `${gameData.pixelSize}px`;
            td.style.cursor = 'default';
            td.style.padding = '0';
            td.id = `${row} ${column}`;
            let audio = document.createElement('AUDIO');
            audio.src = './gravel1.ogg';
            td.appendChild(audio);

            td.addEventListener('mouseenter', changeColor, false);
            td.addEventListener('mouseleave', resetColor, false);
            td.addEventListener('mousedown', buttonClicked, false);
            td.addEventListener('mouseup', resetClicked, false);
            td.addEventListener('click', clickEvent, false);
            td.addEventListener('contextmenu', clickEvent, false);
            // td.onclick = stopwatch();
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }


    gameData.boardGrid.appendChild(table);
    randomizeMineCoordinates();

    generateAdjacentBlocks()
};

let changeColor = (event) => {
    let coordinates = event.target.id.split(' ');
    let row = parseInt(coordinates[0]);
    let column = parseInt(coordinates[1]);

    let td = document.getElementById(`${row} ${column}`);
    if (td.style.backgroundColor === '#151515') return;

    if (gameData.board[row][column].isRevealed && gameData.board[row][column].blockNumber === 0) {
        return
    } else if (gameData.board[row][column].isRevealed && gameData.board[row][column].blockNumber !== 0) {
        gameData.board[row][column].color === '#A2D149' ? td.style.backgroundColor = '#ECD1B7' :
            td.style.backgroundColor = '#E2C9B3';
    } else {
        gameData.board[row][column].color === '#A2D149' ? td.style.backgroundColor = '#BEE17D' :
            td.style.backgroundColor = '#B9DD76';
    }
};

// part of my view
let resetColor = (event) => {
    let coordinates = event.target.id.split(' ');
    let row = parseInt(coordinates[0]);
    let column = parseInt(coordinates[1]);

    let td = document.getElementById(`${row} ${column}`);
    if (td.style.backgroundColor === '#151515') return;

    if (gameData.board[row][column].isRevealed) {
        td.style.backgroundColor = gameData.board[row][column].altColor;
    } else {
        td.style.backgroundColor = gameData.board[row][column].color;
    }
};

let init = () => {
    theGrid();
};

// this is also part of my model
let randomizeMineCoordinates = () => {
    let minesPlaced = 0;
    while (minesPlaced < gameData.numberOfMines) {
        let randRow = Math.floor((Math.random() * gameData.dimensions[0] - 1) + 1);
        let randColumn = Math.floor((Math.random() * gameData.dimensions[1] - 1) + 1);
        if (!gameData.board[randRow][randColumn].isMine) {

            gameData.board[randRow][randColumn].isMine = true;
            gameData.mineLocations.push([randRow, randColumn]);
            minesPlaced++;
        }
    }
};

// this is part of my model
let generateAdjacentBlocks = () => {
    for (let row = 0; row < gameData.dimensions[0]; row++) {
        for (let col = 0; col < gameData.dimensions[1]; col++) {
            if (row === 0 && col === 0) {
                gameData.board[row][col].adjBlocks = [[row, col + 1], [row + 1, col + 1], [row + 1, col]];
            } else if (row === 0 && col === gameData.dimensions[1] - 1) {
                gameData.board[row][col].adjBlocks = [[row, gameData.dimensions[1] - 2], [row + 1, gameData.dimensions[1] - 2],
                    [row + 1, gameData.dimensions[1] - 1]]
            } else if (row === gameData.dimensions[0] - 1 && col === 0) {
                gameData.board[row][col].adjBlocks = [[gameData.dimensions[0] - 2, col],
                    [gameData.dimensions[0] - 2, col + 1], [gameData.dimensions[0] - 1, col + 1]]
            } else if (row === gameData.dimensions[0] - 1 && col === gameData.dimensions[1] - 1) {
                gameData.board[row][col].adjBlocks = [
                    [gameData.dimensions[0] - 1, gameData.dimensions[1] - 2],
                    [gameData.dimensions[0] - 2, gameData.dimensions[1] - 2],
                    [gameData.dimensions[0] - 2, gameData.dimensions[1] - 1]
                ]
            } else if (row === 0) {
                gameData.board[row][col].adjBlocks = [
                    [row, col - 1], [row + 1, col - 1], [row + 1, col], [row + 1, col + 1], [row, col + 1]
                ]
            } else if (row === gameData.dimensions[0] - 1) {
                gameData.board[row][col].adjBlocks = [
                    [gameData.dimensions[0] - 1, col - 1], [gameData.dimensions[0] - 2, col - 1],
                    [gameData.dimensions[0] - 2, col], [gameData.dimensions[0] - 2, col + 1],
                    [gameData.dimensions[0] - 1, col + 1]
                ]
            } else if (col === 0) {
                gameData.board[row][col].adjBlocks = [
                    [row - 1, col], [row - 1, col + 1], [row, col + 1], [row + 1, col + 1], [row + 1, col]
                ]
            } else if (col === gameData.dimensions[1] - 1) {
                gameData.board[row][col].adjBlocks = [
                    [row - 1, gameData.dimensions[1] - 1], [row - 1, gameData.dimensions[1] - 2],
                    [row, gameData.dimensions[1] - 2], [row + 1, gameData.dimensions[1] - 2],
                    [row + 1, gameData.dimensions[1] - 1]
                ]
            } else {
                gameData.board[row][col].adjBlocks = [
                    [row - 1, col - 1], [row - 1, col], [row - 1, col + 1],
                    [row, col - 1], [row, col + 1],
                    [row + 1, col - 1], [row + 1, col], [row + 1, col + 1]
                ]
            }

            let minesTouching = 0;
            let adj = gameData.board[row][col].adjBlocks;

            for (let i = 0; i < adj.length; i++) {
                if (gameData.board[adj[i][0]][adj[i][1]].isMine) {
                    minesTouching++;
                }
            }

            gameData.board[row][col].blockNumber = minesTouching;
            for (let i = 0; i < adj.length; i++) {
                gameData.board[row][col].adjBlocks[i].push(minesTouching);
            }
        }
    }

    for (let row = 0; row < gameData.dimensions[0]; row++) {
        for (let col = 0; col < gameData.dimensions[1]; col++) {
            let adj = gameData.board[row][col].adjBlocks;
            if (!gameData.board[row][col].isMine && gameData.board[row][col].blockNumber === 0) {
                gameData.board[row][col].isBlankBlock = true;
                for (let i = 0; i < adj.length; i++) {
                    gameData.board[row][col].revealBag.push([adj[i][0], adj[i][1],
                        gameData.board[adj[i][0]][adj[i][1]].blockNumber])
                }
            }
        }
    }
};

// this would also be my view
let revealOneSquare = (row, column) => {
    let td = document.getElementById(`${row} ${column}`);
    if (!gameData.board[row][column].isRevealed && !gameData.board[row][column].isMine &&
        !gameData.board[row][column].hasFlag) {

        gameData.board[row][column].isRevealed = true;
        td.style.backgroundColor = gameData.board[row][column].altColor;
        let adj = gameData.board[row][column].adjBlocks;
        for (let i = 0; i < adj.length; i++) {
            // todo - need to check if any adjacent squares to this one aren't revealed and then add a border to those
        }
        let span = document.createElement('span');
        span.style.pointerEvents = 'none';
        span.innerText = gameData.board[row][column].blockNumber === 0 ? '' :
            gameData.board[row][column].blockNumber;
        span.style.fontSize = gameData.fontSize;
        span.style.fontWeight = '800';
        switch (gameData.board[row][column].blockNumber) {
            case 1: {
                span.style.color = '#2376D2';
                break;
            } case 2: {
                span.style.color = '#388E3C';
                break;
            } case 3: {
                span.style.color = '#D32F2F';
                break;
            } case 4: {
                span.style.color = '#7B1FA2';
                break;
            } case 5: {
                span.style.color = '#FD920B';
                break;
            } default: {
                break;
            }
        }
        td.appendChild(span);
    }
};

// this would be my view
let revealSquares = (row, column, specialClick=false) => {
    if (gameData.board[row][column].isRevealed && !specialClick) return;
    let td = document.getElementById(`${row} ${column}`);
    if (!gameData.board[row][column].hasFlag) {
        if (gameData.board[row][column].isMine) {
            td.style.backgroundColor = '#151515';
            hasLost()
        } else {
            // todo - need to add a trigger to reveal all squares touching the one i click if its a specialClick.
            revealOneSquare(row, column);

            if (gameData.board[row][column].isBlankBlock) {
                let revBag = gameData.board[row][column].revealBag;

                for (let i = 0; i < revBag.length; i++) {
                    if (revBag[i][2] === 0) {
                        revealSquares(revBag[i][0], revBag[i][1]);
                    } else {
                        revealOneSquare(revBag[i][0], revBag[i][1]);
                    }
                }
            } else if (specialClick) {
                let adjBag = gameData.board[row][column].adjBlocks;

                for (let i = 0; i < adjBag.length; i++) {
                    if (gameData.board[adjBag[i][0]][adjBag[i][1]].isBlankBlock) {
                        revealSquares(adjBag[i][0], adjBag[i][1]);
                    } else {
                        revealOneSquare(adjBag[i][0], adjBag[i][1])
                    }
                }
            }
        }
    }
};

let buttonClicked = (event) => {
    event.preventDefault();

    if (event.button === 0) {
        gameData.leftButton = true;
    }
    if (event.button === 2) {
        gameData.rightButton = true;
    }

};

let resetClicked = (event) => {
    event.preventDefault();

    if (event.button === 0) {
        gameData.leftButton = false;
    }
    if (event.button === 2) {
        gameData.rightButton = false;
    }
};

let hasWon = () => {
    // maybe go through each block and check if it is revealed, and if all but the mines are revealed you win.
    // ORR as you reveal a square, keep a tally of how many squares have been revealed, then if they have all
    // been revealed except for the number of mines you've won

    // todo - set audio to 80% volume
    let totalRevealed = 0;
    let totalBlocks = gameData.dimensions[0] * gameData.dimensions[1];
    let numMines = gameData.numberOfMines;
    for (let row = 0; row < gameData.dimensions[0]; row++) {
        for (let column = 0; column < gameData.dimensions[1]; column++) {
            if (gameData.board[row][column].isRevealed && !gameData.board[row][column].isMine) {
                totalRevealed++;
            }
        }
    }

    return totalRevealed + numMines === totalBlocks;
};

let hasLost = () => {
    if (!gameData.lose) {
        gameData.lose = true;
        let audio = document.createElement('AUDIO');
        audio.id = 'ff_lose_audio';
        audio.src = './continue.mp3';
        document.body.appendChild(audio);
        audio.load();
        audio.play();
    }


};

let increment = () => {
    gameData.seconds++;
    gameData.stopwatchSpanSeconds.textContent = gameData.seconds < 10 ? '00' + gameData.seconds :
        10 < gameData.seconds < 100 ? '0' + gameData.seconds : gameData.seconds;
    stopwatch();
};

let stopwatch = () => {
    gameData.stopwatch = setTimeout(increment, 1000);
};

let pauseStopwatch = () => {
    clearTimeout(gameData.stopwatch);
};

let clickEvent = (event) => {
    event.preventDefault();
    let coordinates = event.target.id.split(' ');
    let row = parseInt(coordinates[0]);
    let column = parseInt(coordinates[1]);
    let td = document.getElementById(`${row} ${column}`);

    let clickRow = document.getElementById("clickLocationRow");
    let clickCol = document.getElementById("clickLocationCol");
    clickRow.innerHTML = `<span>Row: ${row + 1}</span>`;
    clickCol.innerHTML = `<span>Column: ${column + 1}</span>`;

    if (event.button === 2 && !gameData.leftButton) {

        if (gameData.board[row][column].isRevealed) return;
        if (gameData.board[row][column].hasFlag) {
            gameData.flagsRemainingElement.innerText++;
        } else {
            gameData.flagsRemainingElement.innerText--;
        }
        gameData.board[row][column].hasFlag = !gameData.board[row][column].hasFlag;

        // this is freaking out because once i place a flag and click again, i'm clicking on the flag not the block
        let f = document.getElementById(`flag_${row}_${column}`);

        if (f !== null && f !== undefined && f !== 'undefined') {
            event.target.removeChild(f);

        } else {

            let flag = document.createElement('i');
            flag.id = `flag_${row}_${column}`;
            flag.className = 'fas fa-flag';
            flag.style.color = '#E63307';
            flag.style.pointerEvents = 'none';
            event.target.appendChild(flag);
        }
    } else if (event.button === 0 && !gameData.rightButton) {
        if (gameData.board[row][column].isMine) {
            hasLost();
            // todo - need to detect if i have a flag on a block that isn't a mine and i L/R click on it, it should end the game.
            // todo - i need to disable the board grid and then dim the opacity and set a background
            let lostDiv = document.getElementById('lost_game');
            lostDiv.style.display = 'block';
            lostDiv.style.visibility = 'visible';
            lostDiv.style.opacity = '1';
            gameData.boardTitle.style.pointerEvents = 'none';
            gameData.boardGrid.style.pointerEvents = 'none';
        }
        if (gameData.board[row][column].isRevealed || gameData.board[row][column].hasFlag) {
            return
        } else {
            td.childNodes[0].play();
            revealSquares(row, column);
        }
    }

    if (gameData.board[row][column].isRevealed) {

        if ((gameData.rightButton && gameData.leftButton) || (gameData.leftButton && gameData.rightButton) ||
            (event.button === 0 && gameData.rightButton) || (gameData.rightButton && event.button === 0) ||
            (event.button === 2 && gameData.leftButton) || (gameData.leftButton && event.button === 2)) {

            let adj = gameData.board[row][column].adjBlocks;
            let totalFlags = 0;
            for (let i = 0; i < adj.length; i++) {
                if (gameData.board[adj[i][0]][adj[i][1]].hasFlag) totalFlags++;
            }

            if (gameData.board[row][column].blockNumber !== 0) {
                if (gameData.board[row][column].blockNumber === totalFlags) {
                    // todo - i need to find the locations where the flags are layed. Then find where the mines are.
                    // todo - if the flags aren't placed on the mine and i both click it should end the game.
                    td.childNodes[0].play();
                    revealSquares(row, column, true);
                } else if (totalFlags < gameData.board[row][column].blockNumber) {
                    return;
                } else if (totalFlags > gameData.board[row][column].blockNumber) {
                    // return
                    hasLost();
                    // todo -- end game if you have put more flags then there are mines
                }
            }
        }
    }

    // todo - no matter what once init has started we get rid of this element
    setTimeout(() => {
        if (hasWon()) {
            gameData.win = true;
            let audio = document.createElement('AUDIO');
            audio.id = 'ff_win_audio';
            // let source = document.createElement('source');
            audio.src = './victory_fanfare.mp3';
            document.body.appendChild(audio);
            // source.type = 'audio/mpeg';
            // audio.appendChild(source);
            // table.appendChild(audio);
            audio.load();
            audio.play();
            setTimeout(() => {
                alert("You've WON!");
            }, 100)
        }
    }, 100);
};


theGrid();
