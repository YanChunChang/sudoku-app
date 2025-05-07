import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { SudokuService } from '../../services/sudoku.service';

@Component({
  selector: 'app-sudoku-board',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './sudoku-board.component.html',
  styleUrl: './sudoku-board.component.scss'
})
export class SudokuBoardComponent {
  form!: FormGroup;
  initialBoard!: number[][];
  solvedBoard!: number[][];

  constructor(private fb: FormBuilder, private sudokuService: SudokuService, private route: ActivatedRoute,) {
  }

  ngOnInit() {
    //subscribe necessary for route changing
    this.route.paramMap.subscribe(params => {
      const level = params.get('level')
      this.sudokuService.generateSudoku(level);
      this.initialBoard = this.sudokuService.initialBoard;
      this.solvedBoard = this.sudokuService.solvedBoard;

      // wait til board loads
      const boardArray = this.createBoard();
      this.form = this.fb.group({
        board: this.fb.array(boardArray)
      })
    })

    this.form.valueChanges.subscribe(board => {
      //todo
    })
  }

  //initialboard has value 0, in formcontrol 0 is present as null to show space in html
  createBoard(): FormArray[] {
    const board: FormArray[] = [];
    for (let i = 0; i < 9; i++) {
      const row: FormArray = this.fb.array([]);
      for (let j = 0; j < 9; j++) {
        const value = this.initialBoard[i][j];
        const cell: FormControl = value === 0 ? this.fb.control(null, [Validators.required, Validators.pattern(/[1-9]/)]) : this.fb.control(value);
        row.push(cell);
      }
      board.push(row);
    }
    return board;
  }

  get board(): FormArray {
    return this.form.get('board') as FormArray;
  }

  get rowControls(): FormArray[] {
    return (this.form.get('board') as FormArray).controls as FormArray[];
  }

  //hol einzelne Value vom 2d-Fromarray
  getCell(row: number, col: number): FormControl {
    return (this.board.at(row) as FormArray).at(col) as FormControl;
  }

  onInputChanged(row: number, col: number): boolean {
    const userValue = this.getCell(row, col).value;
    const correctValue = this.solvedBoard[row][col];
    return Number(userValue) === correctValue;
  }

  getCellClass(row: number, col: number): string {
    const userValue = this.getCell(row, col).value;

    if (this.initialBoard[row][col] !== 0) {
      return ""
    }else if (userValue === null) {
      return ""
    } else {
      return this.onInputChanged(row, col) ? "correct" : "incorrect";
    }
  }

  //Validator in Angular only check the value like e.g. control.invalid 
  //todo chinese still can be typed in cell because of composition event
  onKeyDown(event: KeyboardEvent){
    const allowedKeys =[
      '1', '2', '3', '4', '5', '6', '7', '8', '9','Backspace', 'Delete',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown','Tab'];
    
    if (!allowedKeys.includes(event.key)){
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    this.sudokuService.clearBoards();
    console.log("check")
  }

}
