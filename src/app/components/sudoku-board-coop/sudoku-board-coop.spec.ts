import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SudokuBoardCoop } from './sudoku-board-coop';

describe('SudokuBoardCoop', () => {
  let component: SudokuBoardCoop;
  let fixture: ComponentFixture<SudokuBoardCoop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SudokuBoardCoop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SudokuBoardCoop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
