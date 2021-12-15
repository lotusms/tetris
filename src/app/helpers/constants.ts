export const COLORS = [
  'none',
  'rgba(33, 150, 243)',
  'rgba(40, 167, 69)',
  'rgba(255, 193, 7)',
  'rgba(168, 18, 33)',
  'rgba(208, 130, 64)',
  'rgba(253, 74, 156)',
  'rgba(32, 201, 151)',
];
export const SHAPES = [
  [],                                                         // Empty
  [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],   // I
  [[2, 0, 0], [2, 2, 2], [0, 0, 0]],                          // J
  [[0, 0, 3], [3, 3, 3], [0, 0, 0]],                          // L
  [[4, 4], [4, 4]],                                           // Square
  [[0, 5, 5], [5, 5, 0], [0, 0, 0]],                          // S
  [[0, 6, 0], [6, 6, 6], [0, 0, 0]],                          // T
  [[7, 7, 0], [0, 7, 7], [0, 0, 0]]                           // Z
];

export class KEY {
  static readonly ESC = 27;
  static readonly SPACE = 32;
  static readonly LEFT = 37;
  static readonly UP = 38;
  static readonly RIGHT = 39;
  static readonly DOWN = 40;
}

//time in ms. I didn't know what would be the right delay per level so I searched this from Tetris website itself
export class LEVEL {
  static readonly 0 = 800;
  static readonly 1 = 720;
  static readonly 2 = 630;
  static readonly 3 = 550;
  static readonly 4 = 470;
  static readonly 5 = 380;
  static readonly 6 = 300;
  static readonly 7 = 220;
  static readonly 8 = 130;
  static readonly 9 = 100;
  static readonly 10 = 80;
  static readonly 11 = 80;
  static readonly 12 = 80;
  static readonly 13 = 70;
  static readonly 14 = 70;
  static readonly 15 = 70;
  static readonly 16 = 50;
  static readonly 17 = 50;
  static readonly 18 = 50;
  static readonly 19 = 30;
  static readonly 20 = 30;
}
