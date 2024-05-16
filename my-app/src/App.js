/// Ideas
/// 1) DONE make winning calculation not hardcoded to adjust board size (3x3, 4x4, 8x8...)
/// 2) DONE and adjust how many in a row to win (3, 4, 5) to not be hardcoded
/// 3) DONE add toggles (drop down list?) to adjust board size / how many in a row to win
/// 4) DONE add co caro blocked rule?
/// 5) DONE Display the location for each move in the format (row, col) in the move history list.
/// 6) DONE When someone wins, highlight the X squares that caused the win
/// 7) DONE disable select box
/// 8) DONE add check box for blocked rule
/// 9) let's make the select options in a loop, too
/// 10) and implement on aidan-le-beard.github.io

// to use state
import { useState } from 'react';

// takes "props" value and onSquareClick
function Square({ value, onSquareClick, winningColor }) {

  // curly braces let us use javascript, inside the JSX
  return <button className="square" style={{ backgroundColor: winningColor }} onClick={onSquareClick}>{value}</button>
}

function Board({ xIsNext, squares, onPlay, rowColLength, requiredToWin, blockedRule }) {

  function handleClick(i) {

    if (squares[i] || calculateWinner(squares, rowColLength, requiredToWin, blockedRule)) {
      return;
    }

    const nextSquares = squares.slice();

    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares, rowColLength, requiredToWin, blockedRule);
  let status;
  if (winner) {
    status = "Winner: " + squares[winner[0]];

    // Implement draw condition
  } else if (squares.slice(0, rowColLength ** 2).filter(x => x).length === rowColLength ** 2) {
    status = "The game is a draw.";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  // if there's a winner, matches the winning indices returned to the index sent on Square creation, and returns blue on match
  function returnColor(i) {
    if (winner && winner.includes(i)) {
      return 'lightskyblue';
    }
    return;
  }

  // vars for storing div rows, and Square elements
  let rowList = [];
  let squareList = [];

  // loop creates div rows and Square children by pushing to array vars, based on row/column size
  for (let i = 0; i < rowColLength ** 2; i++) {

    // push Square element to array of squares
    squareList.push(<Square key={i} value={squares[i]} winningColor={returnColor(i)} onSquareClick={() => handleClick(i)} />);

    if ((i + 1) % rowColLength === 0 && i > 0) {
      // when a full row is complete, push the squares as children to the div
      rowList.push(<div key={(i + 1) / rowColLength} className="board-row">{squareList}</div>);

      // clear the array of squares for the next div/row
      squareList = [];
    }
  }

  // return our created row/board
  return (
    <>
      <div className="status">{status}</div>
      {rowList}
    </>

  );
}

export default function Game() {

  // var for storing row/col length
  const [rowColLength, setRowColLength] = useState(3);
  // var for storing how many Xs/Os in a row required to win
  const [requiredToWin, setRequiredToWin] = useState(3);
  const [history, setHistory] = useState([Array(rowColLength ** 2).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  // var for changing order of moves to be ascending/descending
  const [descMovesList, setDescMovesList] = useState(0);
  // var for storing if blocked rule is checked or not
  const [blockedRule, setBlockedRule] = useState(false);

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  // button function. Changes current move.
  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  // button function. Turns blocked rule off/on based on checkbox
  function activateBlockedRule(value) {
    setBlockedRule(!blockedRule);
  }

  // changes the board size
  function changeBoardSize(value) {

    // determine if a move is being pushed off the board when decreasing size, and jump to move 0, if so
    let maxIndexPosition = 8;
    for (let i = history[history.length - 1].length - 1; i > maxIndexPosition; i--) {
      if (history[history.length - 1][i]) {
        maxIndexPosition = i;
        break;
      }
    }
    if (value < rowColLength && maxIndexPosition > value ** 2 - 1) {
      jumpTo(0);
    // if all moves are back on board when increasing size, jump to last move
    } else if (value > rowColLength && maxIndexPosition < value ** 2) {
      jumpTo(history[history.length - 1].filter(x => x).length);
    }

    setRowColLength(value);
  }

  // button function. Reverses the order of moves.
  function toggleSort() {
    setDescMovesList(!descMovesList)
  }

  // changes how many in a row to win
  function changeReqToWin(value) {
    setRequiredToWin(value);
  }

  // to keep track of visible moves on the board/list
  let counter = 0;
  const moves = history.map((squares, move) => {
    let description;
    let rowColPos = []; // holds the calculated [row, col] position of the move
    let rowColIndex = 0;

    if (move > 0) {

      // loop finds out what position the move was made at by checking where the difference in the prior history array position is
      for (let i = 0; i < history[move].length; i++) {
        if (history[move][i] != history[move - 1][i]) {
          // now that the position is found, calculate the row and column position
          rowColPos.push(Math.ceil((i + 1) / rowColLength));
          rowColPos.push((i % rowColLength) + 1);
          rowColIndex = i;
          break;
        }
      }

      description = 'Go to move #' + counter + " (" + rowColPos[0] + ", " + rowColPos[1] + ")";
    } else {
      description = 'Go to game start';
    }

    // check if not the current move, and return a button to jump to that move, if not
    if (move != currentMove && rowColIndex <= rowColLength ** 2) {
      counter++;
      return (
        <li key={move}>
          <button onClick={() => jumpTo(move)}>{description}</button>
        </li>
      );

      // else, if it is the current move, show text that we are at the current move (or game start)
    } else if (rowColIndex <= rowColLength ** 2) {
      try {
        return (
          // put inline CSS styling to remove number from current position, and special condition for game start (move 0).
          <li key={move} style={{ listStyleType: "none" }}>You are at {currentMove == 0 ? "game start." : "move #" + counter + " (" + rowColPos[0] + ", " + rowColPos[1] + ")"}</li>
        );
      } finally {
        counter++;
      }
    } else {
      return;
    }
  });

  if (descMovesList) {
    moves.reverse();
  }

    // create select options in a loop
    let rowSelect = [];
    let toWinSelect = [];
      for (let i = 3; i <= 25; i++) {
      rowSelect.push(<option key={i} disabled={requiredToWin > i} value={i}>{i}x{i}</option>);
      if (i <= 10) {
        toWinSelect.push(<option key={i} disabled={i > rowColLength} value={i}>{i}</option>);
      }
    }

  return (
    <>
      <div className="game">
        <div className="game-board">
          <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} rowColLength={rowColLength} requiredToWin={requiredToWin} blockedRule={blockedRule} />
        </div>
        <div className="game-info">
          {/* Reverse the order of the list if descending order, as well. */}
          <ol reversed={descMovesList}> {moves} </ol>
          <ul> <li style={{ listStyleType: "none" }} onClick={() => toggleSort()}><button>Toggle list to {descMovesList ? "ascending" : "descending"} order.</button> </li> </ul>
        </div>
      </div>
      <div className="game">
        <div>
          <label htmlFor="rowColSelect">Choose board size:</label>
          <select className="dropDown" id="rowColSelect" defaultValue={3} onChange={() => changeBoardSize(parseInt(rowColSelect.value))}>
            {rowSelect} {/* select options created in loop above */}
          </select>
        </div>
        <div>
          <label htmlFor="reqToWinSelect">Choose how many in a row to win:</label>
          <select className="dropDown" id="reqToWinSelect" defaultValue={3} onChange={() => changeReqToWin(parseInt(reqToWinSelect.value))}>
            {toWinSelect} {/* select options created in loop above */}
          </select>
        </div>
      </div>
      <div>
        <label><input type="checkbox" defaultChecked={false} onChange={() => activateBlockedRule()}/>Blocked Rule (Co Caro)?</label>
      </div>
    </>
  );
}

function calculateWinner(squares, rowColLength, requiredToWin, blockedRule) {
  // array that holds the winning lines (array positions)
  const lines = [];
  // array that holds one specific line that can win
  let winningLine = []

  // loop determines all row (horizontal) winning combinations
  for (let i = 0; i < rowColLength ** 2; i++) {

    winningLine.push(i);

    // push a winning line to array if the array size is equal to how many positions are required to win
    if (winningLine.length === requiredToWin) {
      lines.push(winningLine);
      winningLine = [];
    }

    // reset i if there are more winning combinations possible on a row
    if (winningLine.length === 0 && (((i + 1) % rowColLength) != 0)) {
      i -= (requiredToWin - 1);
    }
  }

  winningLine = [];

  // loop determines all column (vertical) winning combinations
  for (let i = 0; i < rowColLength ** 2; i += rowColLength) {

    winningLine.push(i);


    // push a winning line to array if the array size is equal to how many positions are required to win
    if (winningLine.length === requiredToWin) {
      lines.push(winningLine);
      winningLine = [];
    }

    // reset i if there are more winning combinations possible on a row
    if (winningLine.length === 0) {
      i -= (rowColLength * requiredToWin) - 1;
    }
  }

  winningLine = [];

  // loop determines diagonal winning combinations from left to right
  for (let i = 0; i < rowColLength ** 2; i += rowColLength + 1) {

    winningLine.push(i);

    // push a winning line to array if the array size is equal to how many positions are required to win
    if (winningLine.length === requiredToWin) {
      lines.push(winningLine);
      winningLine = [];
    }

    // if the next potential diagonal spot is actually 2 rows down (not in the diagonal) then give up on this diagonal
    if (((Math.ceil((i + rowColLength + 2) / rowColLength) - Math.ceil((i + 1) / rowColLength)) > 1) && winningLine.length > 0) {
      i = winningLine[0] + 1 - (rowColLength + 1);
      winningLine = [];
      continue;
    }

    // reset i to next starting square after successful diagonal found
    if (winningLine.length === 0) {
      i -= ((rowColLength + 1) * requiredToWin) - 1;
    }
  }

  winningLine = [];

  // loop determines diagonal winning combinations from right to left
  for (let i = 0; i < rowColLength ** 2; i += rowColLength - 1) {

    winningLine.push(i);

    // push a winning line to array if the array size is equal to how many positions are required to win
    if (winningLine.length === requiredToWin) {
      lines.push(winningLine);
      winningLine = [];
    }

    // if the next potential diagonal spot is actually on the same row (not in the diagonal) then give up on this diagonal
    if (((Math.ceil((i + rowColLength) / rowColLength) - Math.ceil((i + 1) / rowColLength)) < 1) && winningLine.length > 0) {
      i = winningLine[0] + 1 - rowColLength + 1;
      winningLine = [];
      continue;
    }

    // reset i to next starting square after successful diagonal found
    if (winningLine.length === 0) {
      i -= ((rowColLength - 1) * requiredToWin) - 1;
    }
  }

  // check win condition
  let checkWinner = [];
  // fill checkWinner array with squares (X/O) values of possible winning lines
  for (let i = 0; i < lines.length; i++) {
    for (let j = 0; j < lines[i].length; j++) {
      if (squares[lines[i][j]]) {
        checkWinner.push(squares[lines[i][j]]);
      }
    }
    // count times X or O appears, and if 1 or the other is the required number to win, return which one wins
    if ((checkWinner.filter(x => x === "X").length === requiredToWin || checkWinner.filter(x => x === "O").length === requiredToWin) && requiredToWin <= rowColLength) {
      if (!blockedRule || !checkBlocked(lines[i], squares, rowColLength, requiredToWin)) {
        return lines[i];
      }
    }
    // reset checkWinner for the next line to check
    checkWinner = [];
  }

  // if no winner, return null
  return null;
}

// checks if both ends of a winning line are blocked by the opponent
function checkBlocked(lines, squares, rowColLength, requiredToWin) {
  // slice the array so we aren't mutating the original
  let line = lines.slice();
  // interval between all winning moves is equal; so the blocked positions will be on the same interval
  let interval = line[1] - line[0];

  // calculate what move the 2 blocking positions needs to be
  let notWinner;
  if (squares[line[0]] === "X") {
    notWinner = "O";
  } else {
    notWinner = "X";
  }

  // add 2 blocking positions to the line
  line.push(line[line.length - 1] + interval);
  line.unshift(line[0] - interval);

  // blocking cannot occur with invalid array positions or if the board isn't large enough, so return false
  if (line[0] < 0 || line[line.length - 1] >= rowColLength ** 2 || rowColLength < (requiredToWin + 2)) {
    return false;
  }

  // calculate row positions to make sure the blocking positions are in a continuous line with the winning line
  let rowPos = [];
  for (let i = 0; i < line.length; i++) {
    rowPos.push(Math.ceil((line[i] + 1) / rowColLength));
  }
  // if the difference between rows is not consistent, it's not a straight line, so return false
  let rowDiff = rowPos[2] - rowPos[1];
  for (let i = 1; i < rowPos.length; i++) {
    if (rowPos[i] - rowPos[i - 1] != rowDiff) {
      return false;
    }
  }

  // return true if both blocking squares are owned by the opponent
  if (squares[line[0]] === notWinner && squares[line[line.length - 1]] === notWinner) {
    return true;
  }

  return false;
}