/// Ideas
/// 1) adjust board size (3x3, 4x4, 8x8...)

// to use state
import { useState } from 'react';

// takes "props" value and onSquareClick
function Square({ value, onSquareClick }) {

  // curly braces let us use javascript, inside the JSX
  return <button className="square" onClick={onSquareClick}>{value}</button>
}

function Board({ xIsNext, squares, onPlay }) {

  function handleClick(i) {

    if (squares[i] || calculateWinner(squares)) {
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

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;

    // Implement draw condition
  } else if (!squares.includes(null)) {
    status = "The game is a draw.";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  // vars for storing row/column length, div rows, and Square elements
  let rowColLength = 3;
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

  const [history, setHistory] = useState([Array(9).fill(null)]);
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
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        {/* Reverse the order of the list if descending order, as well. */}
        <ol reversed={descMovesList}> {moves} </ol>
        <ul> <li style={{ listStyleType: "none" }} onClick={() => toggleSort()}><button>Toggle list to {descMovesList ? "ascending" : "descending"} order.</button> </li> </ul>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}