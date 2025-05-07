export interface SudokuDataRaw {
    puzzle: string;
    solution: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface SudokuDataParsed {
    puzzle: number[][];
    solution: number[][];
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}
