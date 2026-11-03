import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { addDays, toISODate } from './lib/dates';
import { saveData, STORAGE_KEY } from './lib/storage';
import { createSeedData } from './data/seed';
import { makeTask } from './test/factories';
import { act } from 'react';

const today = () => toISODate(new Date());

function setup() {
  const user = userEvent.setup();
  return { user, ...render(<App />) };
}

async function openTab(user: ReturnType<typeof userEvent.setup>, name: string | RegExp) {
  await user.click(screen.getByRole('tab', { name }));
}

async function addTask(
  user: ReturnType<typeof userEvent.setup>,
  { title, due, type }: { title: string; due: string; type?: string },
) {
  await user.click(screen.getByRole('button', { name: 'Add task' }));
  const dialog = screen.getByRole('dialog');
  await user.type(within(dialog).getByLabelText('Title'), title);
  if (type) await user.selectOptions(within(dialog).getByLabelText('Type'), type);
  await user.type(within(dialog).getByLabelText('Due date'), due);
  await user.click(within(dialog).getByRole('button', { name: 'Add task' }));
}

const savedData = () => JSON.parse(localStorage.getItem(STORAGE_KEY)!);

describe('first run', () => {
  it('seeds General, Upcoming and all five modules', () => {
    setup();
    for (const name of ['Upcoming', 'General', 'COMP3040', 'COMP3041', 'COMP3070', 'MPU 3142MC', 'Final Year Project']) {
      expect(screen.getByRole('tab', { name })).toBeInTheDocument();
    }
  });

  it('starts relaxed with nothing due', () => {
    const { container } = setup();
    expect(container.querySelector('[data-mood]')).toHaveAttribute('data-mood', 'relaxed');
  });
});

describe('tasks', () => {
  it('adds a task to the current module and persists it', async () => {
    const { user } = setup();
    await openTab(user, 'COMP3070');
    await addTask(user, { title: 'Prolog lab', due: addDays(today(), 10), type: 'Exam' });

    expect(screen.getByText('Prolog lab')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Exams/ })).toBeInTheDocument();
    expect(savedData().tasks[0]).toMatchObject({
      title: 'Prolog lab',
      listId: 'seed-comp3070',
      type: 'exam',
    });
  });

  it('blocks saving without a title or date and explains why', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Add task' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Add task' }));

    expect(screen.getByText('Give this task a title.')).toBeInTheDocument();
    expect(screen.getByText('Choose a due date.')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveFocus();
    expect(savedData().tasks).toEqual([]);
  });

  it('edits a task, keeping values already set', async () => {
    saveData({ ...createSeedData(), tasks: [makeTask({ due: addDays(today(), 20), weight: 30 })] });
    const { user } = setup();
    await openTab(user, 'General');
    await user.click(screen.getByRole('button', { name: 'Edit "Read chapter 3"' }));

    const title = screen.getByLabelText('Title');
    expect(screen.getByLabelText('Weighting % (optional)')).toHaveValue(30);
    await user.clear(title);
    await user.type(title, 'Read chapter 4');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(screen.getByText('Read chapter 4')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('completes a task in one click, and the mascot celebrates then calms down', async () => {
    saveData({ ...createSeedData(), tasks: [makeTask({ due: today() })] });
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
    const { container } = render(<App />);
    const mood = () => container.querySelector('[data-mood]')?.getAttribute('data-mood');

    await openTab(user, /General/);
    expect(mood()).toBe('nervous');

    await user.click(screen.getByRole('checkbox', { name: /Read chapter 3/ }));
    expect(mood()).toBe('happy');

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(mood()).toBe('relaxed');
  });

  it('deletes in one click and can be undone', async () => {
    saveData({ ...createSeedData(), tasks: [makeTask({ due: addDays(today(), 20) })] });
    const { user } = setup();
    await openTab(user, 'General');

    await user.click(screen.getByRole('button', { name: 'Delete "Read chapter 3"' }));
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('checkbox', { name: /Read chapter 3/ })).toBeInTheDocument();
  });
});

describe('organising', () => {
  const mixed = () =>
    saveData({
      ...createSeedData(),
      tasks: [
        makeTask({ id: 'a', title: 'Midterm', type: 'exam', due: addDays(today(), 1) }),
        makeTask({ id: 'b', title: 'Worksheet', type: 'homework', due: addDays(today(), 20) }),
      ],
    });

  it('filters to one type', async () => {
    mixed();
    const { user } = setup();
    await openTab(user, /General/);
    await user.selectOptions(screen.getByLabelText('Show'), 'Exams');

    expect(screen.getByText('Midterm')).toBeInTheDocument();
    expect(screen.queryByText('Worksheet')).not.toBeInTheDocument();
  });

  it('collapses a section but keeps its urgency visible', async () => {
    mixed();
    const { user } = setup();
    await openTab(user, /General/);
    const toggle = screen.getByRole('button', { name: /Exams/ });

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Midterm')).not.toBeVisible();
    expect(toggle).toHaveTextContent('1 urgent');
  });

  it('highlights overdue work and gathers it in Upcoming with its list name', () => {
    saveData({
      ...createSeedData(),
      tasks: [
        makeTask({ title: 'Late report', listId: 'seed-comp3041', due: addDays(today(), -2) }),
        makeTask({ id: 'far', title: 'Far away', due: addDays(today(), 60) }),
      ],
    });
    setup();

    const item = screen.getByText('Late report').closest('li')!;
    expect(item).toHaveAttribute('data-urgency', 'overdue');
    expect(within(item).getByText(/Overdue by 2 days/)).toBeInTheDocument();
    expect(within(item).getByText('COMP3041')).toBeInTheDocument();
    expect(screen.queryByText('Far away')).not.toBeInTheDocument();
  });

  it('offers undo when finishing a task from Upcoming, where it disappears', async () => {
    saveData({ ...createSeedData(), tasks: [makeTask({ due: today() })] });
    const { user } = setup();

    await user.click(screen.getByRole('checkbox', { name: /Read chapter 3/ }));
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('checkbox', { name: /Read chapter 3/ })).not.toBeChecked();
  });
});

describe('cleaner lists', () => {
  it('folds finished tasks into a closed Completed section, with undo', async () => {
    saveData({ ...createSeedData(), tasks: [makeTask({ due: addDays(today(), 20) })] });
    const { user } = setup();
    await openTab(user, 'General');

    await user.click(screen.getByRole('checkbox', { name: /Read chapter 3/ }));

    const completed = screen.getByRole('button', { name: /Completed/ });
    expect(completed).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('All done here. Nice work!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();

    await user.click(completed);
    expect(screen.getByRole('checkbox', { name: /Read chapter 3/ })).toBeChecked();
  });

  it('shows type tags only where types are mixed', async () => {
    saveData({ ...createSeedData(), tasks: [makeTask({ due: today() })] });
    const { user } = setup();

    const upcomingRow = screen.getByText('Read chapter 3').closest('li')!;
    expect(within(upcomingRow).getByText('Homework')).toBeInTheDocument();

    await openTab(user, /General/);
    const sectionRow = screen.getByText('Read chapter 3').closest('li')!;
    expect(within(sectionRow).queryByText('Homework')).not.toBeInTheDocument();
  });

  it('groups Upcoming under time headings', () => {
    saveData({
      ...createSeedData(),
      tasks: [
        makeTask({ id: 'a', title: 'Late', due: addDays(today(), -1) }),
        makeTask({ id: 'b', title: 'Now', due: today() }),
        makeTask({ id: 'c', title: 'Soon', due: addDays(today(), 5) }),
        makeTask({ id: 'd', title: 'Further', due: addDays(today(), 12) }),
      ],
    });
    setup();

    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(['Overdue1', 'Today1', 'Next 7 days1', 'Later1']);
  });
});

describe('tab badges', () => {
  it('counts unfinished tasks and turns red only when one is urgent', () => {
    saveData({
      ...createSeedData(),
      tasks: [
        makeTask({ id: 'calm', listId: 'seed-comp3040', due: addDays(today(), 20) }),
        makeTask({ id: 'hot', listId: 'seed-comp3070', due: today() }),
        makeTask({ id: 'cold', listId: 'seed-comp3070', due: addDays(today(), 20) }),
        makeTask({ id: 'done', listId: 'seed-comp3041', due: today(), completed: true }),
      ],
    });
    setup();

    const calm = screen.getByRole('tab', { name: 'COMP3040' });
    expect(calm).toHaveAccessibleDescription('1 to do');
    expect(within(calm).getByText('1')).toHaveAttribute('data-urgent', 'false');

    const hot = screen.getByRole('tab', { name: 'COMP3070' });
    expect(hot).toHaveAccessibleDescription('2 to do, 1 urgent');
    expect(within(hot).getByText('2')).toHaveAttribute('data-urgent', 'true');

    // Finished work doesn't count, so this tab has no badge at all.
    expect(screen.getByRole('tab', { name: 'COMP3041' })).not.toHaveAttribute('aria-describedby');
  });
});

describe('sidebar', () => {
  // Pretend the screen is wide enough for the sidebar layout.
  const wide = () =>
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: true, addEventListener() {}, removeEventListener() {} }),
    });
  const narrow = () => Reflect.deleteProperty(window, 'matchMedia');

  it('folds modules away, keeping a combined badge and the open tab reachable', async () => {
    wide();
    try {
      saveData({ ...createSeedData(), tasks: [makeTask({ listId: 'seed-comp3070', due: today() })] });
      const { user } = setup();
      await openTab(user, /^COMP3070/);
      const toggle = screen.getByRole('button', { name: 'Modules' });

      await user.click(toggle);

      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('tab', { name: /^COMP3070/ })).not.toBeInTheDocument();
      expect(toggle).toHaveAccessibleDescription('1 to do, 1 urgent');
      // The open module's tasks are still on screen.
      expect(screen.getByText('Read chapter 3')).toBeInTheDocument();

      await user.click(toggle);
      expect(screen.getByRole('tab', { name: /^COMP3070/ })).toBeVisible();
    } finally {
      narrow();
    }
  });

  it('remembers that modules were folded', async () => {
    wide();
    try {
      const { user, unmount } = setup();
      await user.click(screen.getByRole('button', { name: 'Modules' }));
      unmount();

      render(<App />);
      expect(screen.getByRole('button', { name: 'Modules' })).toHaveAttribute('aria-expanded', 'false');
    } finally {
      narrow();
    }
  });
});

describe('modules', () => {
  it('adds a module and switches to it', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Add module' }));
    await user.type(screen.getByLabelText('Module name'), 'Databases');
    await user.type(screen.getByLabelText(/Short code/), 'COMP2013');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Add module' }));

    expect(screen.getByRole('tab', { name: 'COMP2013' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'COMP2013 Databases' })).toBeInTheDocument();
  });

  it('renames a module', async () => {
    const { user } = setup();
    await openTab(user, 'COMP3070');
    await user.click(screen.getByRole('button', { name: 'Rename Symbolic AI' }));
    const code = screen.getByLabelText(/Short code/);
    await user.clear(code);
    await user.type(code, 'AI');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(screen.getByRole('tab', { name: 'AI' })).toBeInTheDocument();
  });

  it('warns how many tasks go with a module, then deletes and falls back to General', async () => {
    saveData({ ...createSeedData(), tasks: [makeTask({ listId: 'seed-fyp' })] });
    const { user } = setup();
    await openTab(user, 'Final Year Project');
    await user.click(screen.getByRole('button', { name: 'Delete Final Year Project' }));

    expect(screen.getByText(/also deletes its 1 task/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete module' }));

    expect(screen.queryByRole('tab', { name: 'Final Year Project' })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
    expect(savedData().tasks).toEqual([]);
  });

  it('cancelling the confirmation keeps the module', async () => {
    const { user } = setup();
    await openTab(user, 'Final Year Project');
    await user.click(screen.getByRole('button', { name: 'Delete Final Year Project' }));
    await user.click(screen.getByRole('button', { name: 'Keep module' }));

    expect(screen.getByRole('tab', { name: 'Final Year Project' })).toBeInTheDocument();
  });
});

describe('persistence', () => {
  it('restores tasks and the open tab after a reload', async () => {
    const { user, unmount } = setup();
    await openTab(user, 'COMP3040');
    await addTask(user, { title: 'Flutter app', due: addDays(today(), 10) });
    unmount();

    render(<App />);

    expect(screen.getByRole('tab', { name: 'COMP3040' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Flutter app')).toBeInTheDocument();
  });

  it('picks up changes saved by another browser tab', () => {
    setup();
    const newValue = JSON.stringify({ ...createSeedData(), tasks: [makeTask({ due: today() })] });

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue }));
    });

    expect(screen.getByText('Read chapter 3')).toBeInTheDocument();
  });

  it('warns when saving fails', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't save/);
  });
});
