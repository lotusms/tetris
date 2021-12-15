import { Injectable } from '@angular/core';
import { Tetris_Piece } from '../components/piece.component';

@Injectable({
  providedIn: 'root'
})

export class GameService {

  //Assign points for how many lines are cleared at a time
  getScore(lines: number, level: number): number {
    const addPnts =
      lines === 1 ? 100 : 
      lines === 2 ? 500 : 
      lines === 3 ? 800 : 
      lines === 4 ? 1000 : 0;
    return (level + 1) * addPnts;
  }

  isValid(
    temp: Tetris_Piece, 
    board: number[][]): boolean {
    
    //console log the props for each drop on the piece interface
    // console.log("temp:", temp);

    //console table the baord to see it in a grid
    // console.table(board);

    return temp.shape.every((row, ypos) => {
      return row.every((value, xpos) => {
        //assign the values of x and y  to a repsective variable
        let x = temp.x + xpos;
        let y = temp.y + ypos;
        //find an empty spot
        return (
          this.isEmpty(value) ||
          (this.withinTheCols(x) &&
            this.withinTheRows(y) &&
            this.notOccupied(board, x, y))
        );
      });
    });
    
  }

  // Empty spot
  isEmpty(value: number): boolean {
    return value === 0;
  }

  // the value of x is between 0 and 10
  withinTheCols(x: number): boolean {
    return x >= 0 && x < 10;
  }

  // the value of y is less than 20
  withinTheRows(y: number): boolean {
    return y <= 20;
  }
 
  //check the board to find if the cell equals 0
  notOccupied(board: number[][], x: number, y: number): boolean {
    return board[y] && board[y][x] === 0;
  }

  //rotate the piece by emptying cells and coloring the adjacent cells. The coloring is done by assignement of new x and y values
  rotate(piece: Tetris_Piece): Tetris_Piece {
    let temp: Tetris_Piece = JSON.parse(JSON.stringify(piece));
    for (let y = 0; y < temp.shape.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [temp.shape[x][y], temp.shape[y][x]] = [temp.shape[y][x], temp.shape[x][y]];
      }
    }
    temp.shape.forEach(row => row.reverse());
    return temp;
  }
}
