import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SudokuBoardSingle } from './sudoku-board-single';

describe('SudokuBoardSingle', () => {
  let component: SudokuBoardSingle;
  let fixture: ComponentFixture<SudokuBoardSingle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SudokuBoardSingle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SudokuBoardSingle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
