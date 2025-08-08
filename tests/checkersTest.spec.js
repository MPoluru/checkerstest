import { test, expect } from '@playwright/test';
import { CheckersPage } from '../pages/checkersPage.js';

test('Move 5 times and restart the game', async ({ page }) => {
  const checkers = new CheckersPage(page);
  await checkers.openGame();
  expect(await checkers.isGameLoaded()).toBe(true);
  await checkers.make5DiagonalMoves();
  await checkers.restartGameAndConfirm();
});
