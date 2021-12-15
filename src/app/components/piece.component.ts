import { COLORS, SHAPES } from '../helpers/constants';

//define a Tetris Piece Object schema
export interface Tetris_Piece {
  x: number; //used for the position in the x value
  y: number;  //used for the position in the y value
  color: string;  //used for the color value
  shape: number[][];  //used for the [ [x],[y] ] array configuration to create an arrangement of occupied cells
}

//create the Piece class using the interface
export class Piece implements Tetris_Piece {
  x: number;
  y: number;
  color: string;
  shape: number[][];

  constructor(private canvasContext: CanvasRenderingContext2D) {
    this.create();
  }

  move(temp: Tetris_Piece) {
    this.x = temp.x;
    this.y = temp.y;
    this.shape = temp.shape;
  }

  //randomizer helper func
  randomizer(item: number): number {
    return Math.floor(Math.random() * item + 1);
  }

  create() {
    //run a Math random helper function to pick a number using the shapes array
    const typeId = this.randomizer(SHAPES.length - 1);
    this.shape = SHAPES[typeId];
    this.color = COLORS[typeId];
    this.x = typeId === 4 ? 4 : 3;
    this.y = 0;
    //check the id generated here
    //console.log("typeId: ", typeId);    
  }

  //draw the piece in the board by assiging the reading the x and y values and using canvas fucntions to style them with the color randomized above
  draw() {
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.canvasContext.fillStyle = this.color;
          const currentX = this.x + x;
          const currentY = this.y + y;
          this.canvasContext.fillRect(currentX, currentY, 1, 1);
        }
      });
    });
  }

  drawNext(canvasContextNext: CanvasRenderingContext2D) {
    //first clear the next piece currently in place so that they don't look overlapped. A reset, basically 
    canvasContextNext.clearRect(0, 0, canvasContextNext.canvas.width, canvasContextNext.canvas.height);

    //using the same concept as the draw function but targetting the canvasContentNext
    canvasContextNext.fillStyle = this.color;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          canvasContextNext.fillStyle = this.color;
          const currentX = x + .025;
          const currentY = y + .025;
          canvasContextNext.fillRect(currentX, currentY, 1-.025, 1 -.025);
        }
      });
    });
  }
}
