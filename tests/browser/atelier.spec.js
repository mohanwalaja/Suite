import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.canvas-mat canvas')).toHaveAttribute('data-rendered', 'true');
});

test('daily planner suggests a fresh unused design, remembers it, and can reset history', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Daily Planner' }).click();
  await expect(page.getByRole('heading', { name: 'Daily content plan' })).toBeVisible();
  await expect(page.locator('.planner-details h3')).not.toBeEmpty();
  await expect(page.locator('.planner-copy')).toContainText('astrosivam.com');
  const first = await page.locator('.planner-details h3').textContent();
  await page.getByRole('button', { name: 'New suggestion' }).click();
  await expect(page.locator('.planner-details h3')).not.toHaveText(first);
  await page.getByRole('button', { name: 'Use in studio' }).click();
  await expect(page.locator('.canvas-mat canvas')).toHaveAttribute('data-rendered', 'true');
  const entries = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('astrosivam:creative-history-v1') || '[]'),
  );
  expect(entries.length).toBeGreaterThan(1);
  expect(entries.some((e) => e.source === 'manual')).toBeTruthy();
  await page.reload();
  const afterReload = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('astrosivam:creative-history-v1') || '[]'),
  );
  expect(afterReload.length).toBe(entries.length);
  await page.getByRole('button', { name: 'Daily Planner' }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: /Reset rotation history/ }).click();
  await expect(page.locator('.planner-stats')).toContainText('0');
});

test('layer controls undo and redo, quality report and uncropped story export', async ({ page }) => {
  await page.getByRole('tab', { name: 'Layers' }).click();
  await page.getByLabel('Focal shape').selectOption('circle');
  await expect(page.getByLabel('Focal shape')).toHaveValue('circle');
  await page.getByRole('button', { name: 'Undo last change' }).click();
  await expect(page.getByLabel('Focal shape')).toHaveValue('auto');
  await page.getByRole('button', { name: 'Redo last change' }).click();
  await expect(page.getByLabel('Focal shape')).toHaveValue('circle');
  await page.getByRole('button', { name: 'Check export quality' }).click();
  await expect(page.locator('.quality-card')).toContainText('Ready to export');
  await page.getByLabel('Export placement').selectOption('story');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download poster', exact: true }).click();
  const file = await downloadPromise;
  expect(file.suggestedFilename()).toMatch(/-story\.png$/);
  const png = await readFile(await file.path());
  expect(png.toString('ascii', 1, 4)).toBe('PNG');
  expect(png.readUInt32BE(16)).toBe(1080);
  expect(png.readUInt32BE(20)).toBe(1920);
});
