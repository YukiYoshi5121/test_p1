import React from 'react';

import Header1 from './Header1';
import './index.css';

// =================== Game1 =====================
const sizeH = 3, sizeW = 3;

function Square(props:any) {
  return (
    <button className="square" onClick={() => { props.onClick(); }} >
      {props.value}
    </button>
  );
}

interface IBoardProps{
  squares: number[];
  onClick: (i:number) => void;
}
class Board extends React.Component<IBoardProps, {}> {
  renderSquare(s:number) {
    return (
      <Square 
        value={ this.props.squares[s] }
        onClick={ () => this.props.onClick(s) }
      />
    );
  }
  renderSquareCols(i:number) {
    const colsArray = Array(i).fill(null);
    const cols= colsArray.map((step,col) => {
      return (
        <Square key = {col}
          value={ this.props.squares[col] }
          onClick={ () => this.props.onClick(col) }
        />
      );
    });
    return cols;
  }
  renderBoardXY(i:number, j:number) {
    const colsArray = Array(i).fill(null);
    const rowsArray = Array(j).fill(null);

    const rows = rowsArray.map((stepr,row) => {
      return (
        <div key = {row} className="board-row">
          {colsArray.map((stepc,col) => {
            return (
              <Square key = {col}
                value={ this.props.squares[row*i+col] }
                onClick={ () => this.props.onClick(row*i+col) }
              />
            );
          })}
        </div>
      );
    });
    return rows;
  }
  render() {
    const asdf = (
      <div>
        {this.renderBoardXY(sizeW, sizeH)}
      </div>
    );
    return asdf;
  }
}

interface IGameStates{
  history: any[];
  stepNumber: number;
  xIsNext: boolean;
}
export class Game1 extends React.Component<{}, IGameStates, {}> {
  constructor(props:any){
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
    };
  }
  handleClick(i:number){
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if(squares[i] || calculateWinner(squares)) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X': 'O';
    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }
  jumpTo(move:number){
    this.setState({
      stepNumber: move,
      xIsNext: (move%2)===0,
    });
  }
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ? 'Go to move #'+move : 'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => {this.jumpTo(move)}}>{desc}</button>
        </li>
      );
    });

    let status;
    if(winner) {
      status = 'WInner: ' + winner;
    }
    else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X': 'O');
    }

    return (
      <div>
        <Header1 />
        <div className='game-title'>マルバツゲーム</div>
        <div className="game game1">
          <div className="game-board">
            <Board 
              squares={current.squares}
              onClick={(i:number) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <ol className='game1'>{moves}</ol>
          </div>
        </div>
        <div className='rule'>
          <div>
            <ul>
              <li>勝利条件：縦横ナナメに先に3つ揃える</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares:any[]) {
  const lines = [
    [0,1,2,], [3,4,5,], [6,7,8,],
    [0,3,6,], [1,4,7,], [2,5,8,],
    [0,4,8,], [2,4,6,],
  ];
  for(let i=0; i<lines.length; i++){
    const [a,b,c,] = lines[i];
    if(squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  if(!squares.includes(null)){
    return 'Draw Game...'
  }
  else {
    return null;
  }
}
