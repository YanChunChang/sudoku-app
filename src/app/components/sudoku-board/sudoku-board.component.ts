import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, FormControl, FormGroup } from '@angular/forms';
import { SudokuService } from '../../services/sudoku.service';

@Component({
  selector: 'app-sudoku-board',
  imports: [CommonModule, RouterModule,ReactiveFormsModule],
  templateUrl: './sudoku-board.component.html',
  styleUrl: './sudoku-board.component.scss'
})
export class SudokuBoardComponent {
  form!: FormGroup;
  initialBoard! : number[][];
  solvedBoard! : number[][];

  constructor(private fb: FormBuilder, private sudokuService: SudokuService, private route: ActivatedRoute,) {
  }

  ngOnInit() {
    const level = this.route.snapshot.paramMap.get('level');
    const sudokuData = this.sudokuService.generateSudoku(level);
    this.initialBoard = sudokuData.puzzle;
    this.solvedBoard = sudokuData.solution;

    this.form = this.fb.group({
      board: this.fb.array(this.createBoard())
    })
  }

  createBoard(): FormArray[] {
    const board: FormArray[] = [];
    for(let i = 0; i < 9; i++){
        const row: FormArray = this.fb.array([]);
        for(let j = 0; j < 9; j++){
          const value = this.initialBoard[i][j];
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

}
