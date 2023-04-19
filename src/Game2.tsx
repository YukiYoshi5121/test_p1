import React from "react";

import Header1 from './Header1';
import './index.css';

// =================== Game2 =====================
const sizeH = 11, sizeW = 11;
const player1 = '◆', player2 = '◇';

function Square(props:any) {
  return (
    <button className={`square ${props.isLatest}`.trim()} onClick={() => { props.onClick(); }} >
      {props.value}
    </button>
  );
}

interface IBoardProps{
  squares: number[][];
  latest: {x:number,y:number}
  onClick: (i:number, j:number) => void;
}
class Board extends React.Component<IBoardProps, {}> {
  renderBoardXY() {
    const colsArray = Array(sizeW).fill(null);
    const rowsArray = Array(sizeH).fill(null);

    const rows = rowsArray.map((stepr,row) => {
      return (
        <div key={row} className="board-row">
          {colsArray.map((stepc,col) => {
            return (
              <Square key={col}
                value={ this.props.squares[row][col] }
                isLatest={ (this.props.latest.x === row && this.props.latest.y === col) ? 'latest' : '' }
                onClick={ () => this.props.onClick(row,col) }
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
        {this.renderBoardXY()}
      </div>
    );
    return asdf;
  }
}

interface IGameStates{
  history: any[];
  stepNumber: number;
  xIsNext: boolean;
  //latest: {x:number,y:number}
}
export class Game2 extends React.Component<{}, IGameStates, {}> {
  constructor(props:any){
    super(props);
    this.state = {
      history: [{
        squares: Array(sizeH).fill(0).map(row => new Array(sizeH).fill(null)),
        latest: {x:-1, y:-1},
      }],
      stepNumber: 0,
      xIsNext: true,
    };
  }
  handleClick(i:number, j:number){
    //多次元配列の中身までディープコピーするように修正（Json形式化をはさんで参照を解除）
    const history =  JSON.parse(JSON.stringify(this.state.history.slice(0, this.state.stepNumber + 1)));
    const current = history[history.length - 1];
    const squares = JSON.parse(JSON.stringify(current.squares));
    if(squares[i][j] || calculateWinner(squares)) {
      return;
    }
    squares[i][j] = this.state.xIsNext ? player1: player2;
    this.setState({
      history: history.concat([{
        squares: squares,
        latest: {x: i, y: j},
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

    const historyLength = history.length-1;
    const winCnt = calculateWinner(history[historyLength].squares) ? historyLength : null;

    const moves = history.map((step, s) => {
      const desc = s ? '第 '+s+' 手目' : '初めから';
      return (
        <li key={s} style={{order: -s}}>
          <button className={s===winCnt ? 'winner' : ''} onClick={() => {this.jumpTo(s)}}>{desc}</button>
        </li>
      );
    });

    let status;
    if(winner) {
      status = 'WInner: ' + winner;
    }
    else {
      status = 'Next player: ' + (this.state.xIsNext ? player1: player2);
    }

    return (
      <div>
        <Header1 />
        <div className='game-title'>五目並べ</div>
        <div className="game game2">
          <div className="game-board">
            <Board 
              squares={current.squares}
              latest={current.latest}
              onClick={(i:number, j:number) => this.handleClick(i,j)}
            />
          </div>
          <div className="game-info">
            <div style={{height: 21}}>{status}</div>
            <ol className='game2'>{moves}</ol>
          </div>
        </div>
        <div className='rule'>
          <div>
            <ul>
              <li>勝利条件：縦横ナナメに先に5つ揃える</li>
              <li>※最後に置いたマスを赤で表示</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares:any[][]) {
  //5x5の勝筋
  const lines = [
    [[0,0],[0,1],[0,2],[0,3],[0,4],],
    [[0,0],[1,0],[2,0],[3,0],[4,0],],
    [[0,0],[1,1],[2,2],[3,3],[4,4],],
    [[0,4],[1,3],[2,2],[3,1],[4,0],], 
  ];
  let fillchk = 0;
  for(let i=0; i<sizeH; i++){
    for(let j=0; j<sizeW; j++){
      for(let k=0; k<lines.length; k++){
        let [a,b,c,d,e,] = lines[k];
        //let a = lines[k][0], b = lines[k][1], c = lines[k][2];
        let s1 = (i+a[0] < sizeH && (j+a[1]) < sizeW ) ? squares[i+a[0]][j+a[1]] : null,
            s2 = (i+b[0] < sizeH && (j+b[1]) < sizeW ) ? squares[i+b[0]][j+b[1]] : null,
            s3 = (i+c[0] < sizeH && (j+c[1]) < sizeW ) ? squares[i+c[0]][j+c[1]] : null,
            s4 = (i+d[0] < sizeH && (j+d[1]) < sizeW ) ? squares[i+d[0]][j+d[1]] : null,
            s5 = (i+e[0] < sizeH && (j+e[1]) < sizeW ) ? squares[i+e[0]][j+e[1]] : null;
        if( s1 && s1 === s2 && s1 === s3 && s1 === s4 && s1 === s5 ) {
          return s1;
        }
        if(squares[i][j] === null) fillchk += 1 ;
      }
    }
  }

  if(fillchk === 0){
    return 'Draw Game...'
  }
  else {
    return null;
  }
}
