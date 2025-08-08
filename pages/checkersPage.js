export class CheckersPage {
  constructor(page) {
    this.page = page;
    this.board = '#board';
    
  }

  async openGame() {
    await this.page.goto('https://www.gamesforthebrain.com/game/checkers/');
    await this.page.waitForSelector(this.board);
  }

  async isGameLoaded() {
    return await this.page.locator(this.board).isVisible();
  }

  async make5DiagonalMoves() {
  const board = this.page.locator('#board');
  const rows = await board.locator('div').all();

  let movesMade = 0;
  const movedPieces = new Set();
  console.log(`🟠 Found ${rows.length} board rows`);

  for (let rowIndex = 7; rowIndex >= 0; rowIndex--) {
    const row = rows[rowIndex];
    const cells = await row.locator('img').all();

    for (let colIndex = 0; colIndex < cells.length; colIndex++) {
      const cell = cells[colIndex];
      const src = await cell.getAttribute('src');
      if (!src?.includes('you1')) continue;

      const pieceId = `${rowIndex}_${colIndex}`;
      if (movedPieces.has(pieceId)) continue; // avoid moving same piece twice

      console.log(`🔸 Orange at row ${rowIndex + 1}, col ${colIndex + 1}`);

      const fromBox = await cell.boundingBox();
      if (!fromBox) continue;

      const nextRow = rows[rowIndex - 1];
      if (!nextRow) continue;

      for (const offset of [-1, 1]) {
        const targetCol = colIndex + offset;
        if (targetCol < 0 || targetCol > 7) continue;

        const targetCell = await nextRow.locator(`img:nth-child(${targetCol + 1})`);
        const targetHandle = await targetCell.elementHandle();
        if (!targetHandle) continue;

        const targetSrc = await targetCell.getAttribute('src');
        if (targetSrc !== 'gray.gif') continue; // must be a valid empty cell

        const toBox = await targetHandle.boundingBox();
        if (!toBox) continue;

        // 🔶 Move: Click orange piece
        await this.page.mouse.click(
          fromBox.x + fromBox.width / 2,
          fromBox.y + fromBox.height / 2
        );
        await this.page.waitForTimeout(500); // short delay to register selection

        // 🔶 Move: Click target cell
        await this.page.mouse.click(
          toBox.x + toBox.width / 2,
          toBox.y + toBox.height / 2
        );
        await this.page.waitForTimeout(1200); // wait for AI to respond

        console.log(`✅ Move ${movesMade + 1}: (${rowIndex + 1}, ${colIndex + 1}) → (${rowIndex}, ${targetCol + 1})`);

        movedPieces.add(pieceId);
        movesMade++;

        // Optional: pause to visually inspect
        // await this.page.pause();

        if (movesMade >= 5) {
          console.log(`🎉 Successfully made ${movesMade} diagonal orange moves.`);
          return movesMade;
        }

        break; // move to next piece after a successful move
      }
    }
  }

  console.log(`⚠️ Only made ${movesMade} moves. Game may be blocked.`);
  return movesMade;
}


   
  async restartGameAndConfirm() {
  await this.page.getByText('Restart...').click();
  await this.page.waitForTimeout(1000);

  const message = await this.page.locator('#message').textContent();
  const validMessages = [
    'Select an orange piece to move.'
  ];

  const match = validMessages.some((text) => message.includes(text));
  if (!match) {
    throw new Error(`❌ Game did not restart correctly. Got message: "${message}"`);
  }

  console.log('🔄 Game restarted successfully.');
}

}
