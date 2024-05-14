/// Ideas
/// 1) DONE make winning calculation not hardcoded to adjust board size (3x3, 4x4, 8x8...)
/// 2) DONE and adjust how many in a row to win (3, 4, 5)
/// 3) add toggles (drop down list?) to adjust board size / how many in a row to win
/// 4) add co caro blocked rule?

// to use state
import { useState } from 'react';

// takes "props" value and onSquareClick
function Square({ value, onSquareClick }) {

  // curly braces let us use javascript, inside the JSX
  return <button className="square" onClick={onSquareClick}>{value}</button>
}

function Board({ xIsNext, squares, onPlay, rowColLength }) {

  function handleClick(i) {

    if (squares[i] || calculateWinner(squares, rowColLength)) {
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

  const winner = calculateWinner(squares, rowColLength);
  let status;
  if (winner) {
    status = "Winner: " + winner;

    // Implement draw condition
  } else if (!squares.includes(null)) {
    status = "The game is a draw.";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  // vars for storing div rows, and Square elements
  let rowList = [];
  let squareList = [];

  // loop creates div rows and Square children by pushing to array vars, based on row/column size
  for (let i = 0; i < rowColLength ** 2; i++) {

    // push Square element to array of squares
    squareList.push(<Square key={i} value={squares[i]} onSquareClick={() => handleClick(i)} />);

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
  let rowColLength = 8;
  const [history, setHistory] = useState([Array(rowColLength ** 2).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const [descMovesList, setDescMovesList] = useState(0);

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  // button function. Changes current move.
  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  // button function. Reverses the order of moves.
  function toggleSort() {
    setDescMovesList(!descMovesList)
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }

    // check if not the current move, and return a button to jump to that move, if not
    if (move != currentMove) {
      return (
        <li key={move}>
          <button onClick={() => jumpTo(move)}>{description}</button>
        </li>
      );

      // else, if it is the current move, show text that we are at the current move (or game start)
    } else {
      return (
        // put inline CSS styling to remove number from current position, and special condition for game start (move 0).
        <li key={move} style={{ listStyleType: "none" }}>You are at {currentMove == 0 ? "game start." : "move #" + move}</li>
      );
    }
  });

  if (descMovesList) {
    moves.reverse();
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} rowColLength={rowColLength} />
      </div>
      <div className="game-info">
        {/* Reverse the order of the list if descending order, as well. */}
        <ol reversed={descMovesList}> {moves} </ol>
        <ul> <li style={{ listStyleType: "none" }} onClick={() => toggleSort()}><button>Toggle list to {descMovesList ? "ascending" : "descending"} order.</button> </li> </ul>
      </div>
    </div>
  );
}

function calculateWinner(squares, rowColLength) {
  // number of Xs/Os in a row required to win
  let requiredToWin = 5;
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
      i = winningLine[0] + 1 - rowColLength + 1;
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
    if (checkWinner.filter(x => x === "X").length === requiredToWin || checkWinner.filter(x => x === "O").length === requiredToWin) {
      return squares[lines[i][0]];
    }
    // reset checkWinner for the next line to check
    checkWinner = [];
  }

  // if no winner, return null
  return null;
}