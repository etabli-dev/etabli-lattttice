import { expect, test } from '@playwright/test';

test('hotseat win, saved reload, all views, reset and computer reply', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.goto('/');
  for (const [x,y] of [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1],[3,0]]) {
    await page.getByRole('button', { name: `x${x} y${y} z0 w0, empty`, exact: true }).click();
  }
  await expect(page.getByText('X wins!', { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('lattttice:v1') ?? '{}').winner)).toBe('X');
  await page.reload();
  await expect(page.getByText('X wins!', { exact: true })).toBeVisible();
  for (const view of ['Slices', '3D', 'Heat', 'Grid']) {
    await page.getByRole('button', { name: view, exact: true }).click();
    await expect(page.getByText('X wins!', { exact: true })).toBeVisible();
  }
  await page.screenshot({ path: info.outputPath('won.png'), fullPage: true });
  await page.getByRole('button', { name: 'New Game', exact: true }).click();
  await page.getByRole('button', { name: 'vs Computer', exact: true }).click();
  await page.getByRole('button', { name: 'Easy', exact: true }).click();
  await page.getByRole('button', { name: 'x0 y0 z0 w0, empty', exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('lattttice:v1') ?? '{}').moveLog?.length)).toBe(2);
  await expect(page.getByText('X to move', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});


test('desktop board and controls share the window without horizontal overflow', async ({ page }, info) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const board = page.getByTestId('game-board');
  const settings = page.getByTestId('game-settings');
  await expect(page.getByRole('button', { name: 'x3 y3 z3 w3, empty', exact: true })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'New Game', exact: true })).toBeVisible();
  const b = await board.boundingBox();
  const s = await settings.boundingBox();
  expect(b).not.toBeNull(); expect(s).not.toBeNull();
  expect(s!.x).toBeGreaterThanOrEqual(b!.x + b!.width);
  expect(s!.x + s!.width).toBeLessThanOrEqual(1280);
  await page.screenshot({ path: info.outputPath('desktop.png') });
});
