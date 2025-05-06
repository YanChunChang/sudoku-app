import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, FormControl, FormGroup } from '@angular/forms';
import { SudokuService } from '../../services/sudoku.service';

@Component({
  selector: 'app-sudoku-board',
  imports: [CommonModule, RouterModule,ReactiveFormsModule],
  templateUrl: './sudoku-board.component.html',
  styleUrl: './sudoku-board.component.scss'
})
export class SudokuBoardComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private sudokuService: SudokuService) {
    this.form = this.fb.group({
      board: this.fb.array(this.createBoard())
    })
  }

  createBoard(): FormArray[] {
    const board: FormArray[] = [];
    for(let i = 0; i < 9; i++){
        const row: FormArray = this.fb.array([]);
        for(let j = 0; j < 9; j++){
          const value = this.sudokuBoard[i][j];
          const cell: FormControl = value === 0 ? this.fb.control(null) : this.fb.control(value);
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

  getCell(row: number, col: number): FormControl { 
    return (this.board.at(row) as FormArray).at(col) as FormControl;
  }

  sudokuBoard: number[][] = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ];

  solvedBoard: number[][] = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
  ];


}
