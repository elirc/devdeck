import { useRef, useState } from 'react';
import { useStore } from '../store';
import { ALL_CARD_TYPES, CARD_TYPE_LABELS } from '../types';

export function Settings() {
  const settings = useStore(s => s.settings);
  const decks = useStore(s => s.decks);
  const updateSettings = useStore(s => s.updateSettings);
  const exportBackup = useStore(s => s.exportBackup);
  const importBackup = useStore(s => s.importBackup);
  const wipeProgress = useStore(s => s.wipeProgress);
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const bumpNew = (delta: number) => {
    const value = Math.min(50, Math.max(1, settings.newCardsPerDay + delta));
    updateSettings({ newCardsPerDay: value });
  };

  const toggleType = (type: (typeof ALL_CARD_TYPES)[number]) => {
    const on = settings.enabledCardTypes.includes(type);
    if (on && settings.enabledCardTypes.length === 1) return; // keep at least one
    updateSettings({
      enabledCardTypes: on
        ? settings.enabledCardTypes.filter(t => t !== type)
        : [...settings.enabledCardTypes, type],
    });
  };

  const toggleDeck = (deckId: string) => {
    const on = settings.enabledDeckIds.includes(deckId);
    updateSettings({
      enabledDeckIds: on
        ? settings.enabledDeckIds.filter(id => id !== deckId)
        : [...settings.enabledDeckIds, deckId],
    });
  };

  const onImportFile = (file: File | undefined) => {
    if (!file) return;
    importBackup(file)
      .then(msg => setMessage(msg))
      .catch((err: unknown) =>
        setMessage(err instanceof Error ? err.message : 'Import failed')
      );
  };

  const onReset = () => {
    if (!window.confirm('Reset ALL progress? Your review history and streak will be wiped.'))
      return;
    if (!window.confirm('This cannot be undone. Really reset?')) return;
    void wipeProgress().then(() => setMessage('Progress reset.'));
  };

  return (
    <div className="screen settings">
      <h1 className="screen-title">Settings</h1>

      <section>
        <h2 className="section-title">Reviewing</h2>
        <div className="setting-row">
          <span>New cards per day</span>
          <div className="stepper">
            <button type="button" onClick={() => bumpNew(-1)} aria-label="Fewer">
              −
            </button>
            <span className="stepper-value">{settings.newCardsPerDay}</span>
            <button type="button" onClick={() => bumpNew(1)} aria-label="More">
              +
            </button>
          </div>
        </div>
        <div className="setting-row">
          <span>Theme</span>
          <button
            type="button"
            className="secondary-btn small"
            onClick={() =>
              updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
            }
          >
            {settings.theme === 'dark' ? 'Dark' : 'Light'}
          </button>
        </div>
      </section>

      <section>
        <h2 className="section-title">Card types</h2>
        {ALL_CARD_TYPES.map(type => (
          <label key={type} className="check-row">
            <input
              type="checkbox"
              checked={settings.enabledCardTypes.includes(type)}
              onChange={() => toggleType(type)}
            />
            <span>{CARD_TYPE_LABELS[type]}</span>
          </label>
        ))}
      </section>

      <section>
        <h2 className="section-title">Decks</h2>
        {decks.map(deck => (
          <label key={deck.id} className="check-row">
            <input
              type="checkbox"
              checked={settings.enabledDeckIds.includes(deck.id)}
              onChange={() => toggleDeck(deck.id)}
            />
            <span>{deck.name}</span>
          </label>
        ))}
      </section>

      <section>
        <h2 className="section-title">Data</h2>
        <p className="setting-note">
          Progress lives on this device. Export a backup before clearing browser data or
          switching phones.
        </p>
        <div className="setting-actions">
          <button type="button" className="secondary-btn" onClick={() => void exportBackup()}>
            Export backup
          </button>
          <button type="button" className="secondary-btn" onClick={() => fileRef.current?.click()}>
            Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={e => {
              onImportFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button type="button" className="danger-btn" onClick={onReset}>
            Reset progress
          </button>
        </div>
        {message !== null && <p className="setting-message">{message}</p>}
      </section>

      <p className="version">DevDeck v1.0.0</p>
    </div>
  );
}
