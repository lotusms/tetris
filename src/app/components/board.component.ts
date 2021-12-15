import { Component, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { COLORS, LEVEL, KEY } from '../helpers/constants';
import { Piece, Tetris_Piece } from './piece.component';
import { GameService } from '../services/game.service';

@Component({
  selector: 'board',
  templateUrl: 'board.component.html'
})

//Because we will be watching for the component load AND its children views, I chose to use AfterViewInit instead of OnInit. It waits for a full initialization
export class BoardComponent implements AfterViewInit {

  //Create two references for the board and the next piece on deck
  @ViewChild('board', { static: true }) canvasElementRef: ElementRef<HTMLCanvasElement>;
  @ViewChild('next', { static: true })  canvasNextPieceElementRef: ElementRef<HTMLCanvasElement>;

  canvasContext: CanvasRenderingContext2D;
  canvasContextNext: CanvasRenderingContext2D;

  //declaring a 2-Dimmensional array for the board 
  board: number[][];  //i.e. [ [0], [1] ] 

  //declaring piece and next as Objects of the Piece interface
  piece: Piece;  
  next: Piece;
  
  requestId: number;
  paused: boolean;
  gameStarted: boolean;
  time: { start: number; elapsed: number; level: number };
  points: number;
  highScore: number;
  lines: number;
  level: number;
  moves = {
    //on a key, assign the piece to a temp variable, spread its properties to grab the x and y props and move x-1 on LeftArrow, +1 on RightArrow
    [37]: (temp: Tetris_Piece): Tetris_Piece => ({ ...temp, x: temp.x - 1 }),
    [39]: (temp: Tetris_Piece): Tetris_Piece => ({ ...temp, x: temp.x + 1 }),
    //DownArrow and Space both drop down but Space will be handled differently
    [40]: (temp: Tetris_Piece): Tetris_Piece => ({ ...temp, y: temp.y + 1 }),
    [32]: (temp: Tetris_Piece): Tetris_Piece => ({ ...temp, y: temp.y + 1 }),
    //UpArrow will run the rotate service
    [38]: (temp: Tetris_Piece): Tetris_Piece => this.service.rotate(temp)
  };
  
  getEmptyBoard(): number[][] {
    return Array.from({ length: 20 }, () => Array(10).fill(0));
  }

  //drawing the board
  private addOutlines() {
    //vertical lines
    for(let index = 1; index < 10; index++) {
      this.canvasContext.fillStyle = 'gray';
      this.canvasContext.fillRect(index, 0, .025, this.canvasContext.canvas.height);
    }

    //horizontal lines
    for(let index = 1; index < 20; index++) {
      this.canvasContext.fillStyle = 'gray';
      this.canvasContext.fillRect(0, index, this.canvasContext.canvas.width, .025);
    }
  }

  constructor(private service: GameService) {}

  //Listen for the keydown event to play using the keyboard. This is necessary in order to rotate the pieces. A mouse click event has a 1 and 0 value (true or false). Using a keyboard you can assign different keys a specific functionality
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === "Escape") {
      //If Esc is pressed, run the gemeOver func
      this.gameOver();
    } else if (this.moves[event.keyCode]) {
      //if any of the keys specified in the moves Object is pressed, prevent the key from acting on the window b20er
      event.preventDefault();
      // Assign a new state to temp and pass the current piece to it
      let temp = this.moves[event.keyCode](this.piece);

      if (event.key === "Space") {
        // If space is pressed, drop it to the bottom in one move   
        while (this.service.isValid(temp, this.board)) {
          this.piece.move(temp);
          this.points += 2;
          temp = this.moves["ArrowDown"](this.piece);
        }
      } else if (this.service.isValid(temp, this.board)) {
        this.piece.move(temp);
        if (event.key === "ArrowDown") {
          this.points += 1;
        }
      }
      //check the console to see the valueof temp on each event of keydown
      // console.log("temp:", temp);
    }

  }

  ngAfterViewInit() {
    //Function callbacks
    this.initGameBoard(); 
    this.initNextSpace();
    this.resetGame();
    this.highScore = 0;
  }

  initGameBoard() {
    //Using the getContext method I can return the board object 
    this.canvasContext = this.canvasElementRef.nativeElement.getContext('2d');
    // Calculate size of canvas.
    this.canvasContext.canvas.width = 10 * 30;
    this.canvasContext.canvas.height = 20 * 30;
    // Use the scale method to avoid declaring the size everytime I draw the board canvas.
    this.canvasContext.scale(30, 30);
  }

  initNextSpace() {
    //Same concept as above for the Next Piece space above the buttons
    this.canvasContextNext = this.canvasNextPieceElementRef.nativeElement.getContext('2d');
    //Sixe of the canvas for this space
    this.canvasContextNext.canvas.width = 4 * 30;
    this.canvasContextNext.canvas.height = 2 * 30;
    this.canvasContextNext.scale(30, 30);
  }

  play() {
    this.gameStarted = true; //inititalzed value
    this.resetGame(); //reset the Game
    this.piece = new Piece(this.canvasContext);//create a new Piece Object passing canvasContext props
    this.next = new Piece(this.canvasContext); //create a new Next Object passing canvasContext props
    this.next.drawNext(this.canvasContextNext);
    this.time.start = performance.now();

    // Check for a previews game and cancel it
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }

    this.animate();
  }

  resetGame() {
    //plain ol reset of variable values
    this.points = 0;
    this.lines = 0;
    this.level = 0;
    this.board = this.getEmptyBoard();
    this.time = { start: 0, elapsed: 0, level: LEVEL[this.level] };
    this.paused = false;
    this.addOutlines();
  }

  animate(now = 0) {
    //calculate the time since it started. If that number in ms is higher than the one defined in level. then it strated now. If the drop fucntion is false, run GameOver to show the message
    this.time.elapsed = now - this.time.start;
    if (this.time.elapsed > this.time.level) {
      this.time.start = now;
      if (!this.drop()) {
        this.gameOver();
        return;
      }
    }
    this.draw();
    this.requestId = requestAnimationFrame(this.animate.bind(this));
  }

  draw() {
    //draw the piece and board as well as clear it behind it. This gives it a moving effect
    this.canvasContext.clearRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height);
    this.piece.draw();
    this.drawBoard();
  }

  drop(): boolean {
    //drop a piece to the next available spot
    let temp = this.moves[KEY.DOWN](this.piece);
    if (this.service.isValid(temp, this.board)) {
      this.piece.move(temp);
    } else {
      //once the piece dropped, keep those cells colored
      this.piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            this.board[y + this.piece.y][x + this.piece.x] = value;
          }
        });
      });
      //remove a row when all cells are colored by checking its value !== 0 
      let lines = 0;
      this.board.forEach((row, y) => {
        if (row.every(value => value !== 0)) {
          lines++;
          this.board.splice(y, 1);
          this.board.unshift(Array(10).fill(0));
        }
      });
      //if lines were removed get the amount of lines to calculate the score
      if (lines > 0) {
        this.points += this.service.getScore(lines, this.level);
        this.lines += lines;
        if (this.lines >= 10) {
          this.level++;
          this.lines -= 10;
          this.time.level = LEVEL[this.level];
        }
      }
      if (this.piece.y === 0) {
        return false;
      }
      this.piece = this.next;
      this.next = new Piece(this.canvasContext);
      this.next.drawNext(this.canvasContextNext);
    }
    return true;
  }

  //draw the cells that are used
  drawBoard() {
    this.board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.canvasContext.fillStyle = COLORS[value];
          this.canvasContext.fillRect(x, y, 1, 1);
        }
      });
    });
    this.addOutlines();
  }

  //draw message is the game was paused
  pause() {
    if (this.gameStarted) {
      if (this.paused) {
        this.animate();
      } else {
        this.canvasContext.fillStyle = 'rgba(0,0,0,.5)';
        this.canvasContext.fillRect(0, 0, 10, 20);
        this.canvasContext.font = '1px Arial';
        this.canvasContext.fillStyle = 'white';
        this.canvasContext.fillText('GAME PAUSED', 1.4, 10);
        cancelAnimationFrame(this.requestId); 
      }
      this.paused = !this.paused;
    }
  }

  //draw message is the game ended or failed
  gameOver() {
    this.gameStarted = false;
    cancelAnimationFrame(this.requestId);
    this.highScore = this.points > this.highScore ? this.points : this.highScore;
    this.canvasContext.fillStyle = 'black';
    this.canvasContext.fillRect(0, 0, 10, 20);
    this.canvasContext.font = '1px Arial';
    this.canvasContext.fillStyle = 'red';
    this.canvasContext.fillText('GAME OVER', 1.4, 10);
  }

}
