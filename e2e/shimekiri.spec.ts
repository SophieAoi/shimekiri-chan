import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const isoDaysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

async function addTask(page: Page, title: string, days: number, type = 'Homework') {
  await page.getByRole('button', { name: 'Add task' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Title').fill(title);
  await dialog.getByLabel('Type').selectOption(type);
  await dialog.getByLabel('Due date').fill(isoDaysFromNow(days));
  await dialog.getByRole('button', { name: 'Add task' }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test('full journey survives a reload', async ({ page }) => {
  const mascot = page.locator('[data-mood]');
  await expect(mascot).toHaveAttribute('data-mood', 'relaxed');

  await page.getByRole('tab', { name: 'COMP3070' }).click();
  await addTask(page, 'Prolog coursework', 2, 'Coursework');
  await expect(page.getByText('Prolog coursework')).toBeVisible();
  await expect(mascot).toHaveAttribute('data-mood', 'nervous');

  await page.reload();
  await expect(page.getByRole('tab', { name: 'COMP3070' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('Due in 2 days')).toBeVisible();

  await page.getByRole('checkbox', { name: /Prolog coursework/ }).click();
  await expect(mascot).toHaveAttribute('data-mood', 'happy');
  await expect(mascot).toHaveAttribute('data-mood', 'relaxed', { timeout: 5000 });
});

test('dialog traps focus, closes on Esc and returns focus', async ({ page }) => {
  const add = page.getByRole('button', { name: 'Add task' });
  await add.click();
  await expect(page.getByLabel('Title')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(add).toBeFocused();
});

test('tabs work from the keyboard', async ({ page }) => {
  await page.getByRole('tab', { name: 'Upcoming' }).focus();
  await page.keyboard.press('ArrowRight');
  const general = page.getByRole('tab', { name: 'General' });
  await expect(general).toHaveAttribute('aria-selected', 'true');
  await expect(general).toBeFocused();
});

test('page never scrolls sideways, even with long content', async ({ page }) => {
  await page.getByRole('tab', { name: 'General' }).click();
  await addTask(page, 'x'.repeat(120), -1, 'Exam');
  await addTask(page, 'A normal task', 1);
  // A badge on a tab scrolled out of view once widened the page on phones.
  await page.getByRole('tab', { name: 'Final Year Project' }).click();
  await addTask(page, 'Draft interim report', 1);
  await page.getByRole('tab', { name: 'Upcoming' }).click();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('has no accessibility violations, including contrast', async ({ page }) => {
  // Reduced motion turns off transitions, so axe never measures a colour mid-fade.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('tab', { name: 'General' }).click();
  await addTask(page, 'Overdue exam', -2, 'Exam');
  await addTask(page, 'Soon homework', 1, 'Homework');
  await addTask(page, 'Later coursework', 20, 'Coursework');
  await page.getByRole('checkbox', { name: /Later coursework/ }).click();
  await page.getByRole('button', { name: /Completed/ }).click();
  await page.waitForTimeout(3000); // Let the mascot settle.

  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole('tab', { name: 'Upcoming' }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole('button', { name: 'Add task' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Add task' }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
