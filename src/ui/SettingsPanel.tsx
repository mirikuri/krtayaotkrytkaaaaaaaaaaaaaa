import { useId } from 'react';
import { useGame } from '../engine/store';
import Modal from './Modal';

export default function SettingsPanel() {
  const settings = useGame((s) => s.settings);
  const updateSettings = useGame((s) => s.updateSettings);
  const resetProgress = useGame((s) => s.resetProgress);
  const setOverlay = useGame((s) => s.setOverlay);
  const speedId = useId();
  const fxId = useId();

  const speedLabel = settings.textSpeed === 0 ? 'мгновенно' : `${settings.textSpeed} симв./с`;

  return (
    <Modal title="Настройки" onClose={() => setOverlay(null)}>
      <div className="settings">
        <div className="field">
          <label htmlFor={speedId}>
            Скорость текста: <output htmlFor={speedId}>{speedLabel}</output>
          </label>
          <input
            id={speedId}
            type="range"
            min={0}
            max={120}
            step={5}
            value={settings.textSpeed}
            aria-valuetext={speedLabel}
            onChange={(e) => updateSettings({ textSpeed: Number(e.target.value) })}
          />
        </div>

        <div className="field field--row">
          <span id={fxId}>Эффекты (частицы и параллакс)</span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.effects}
            aria-labelledby={fxId}
            className="switch"
            onClick={() => updateSettings({ effects: !settings.effects })}
          >
            <span className="switch-knob" aria-hidden="true" />
          </button>
        </div>

        <div className="field">
          <button
            type="button"
            className="btn-danger"
            onClick={() => {
              if (window.confirm('Сбросить весь прогресс? Это нельзя отменить.')) {
                resetProgress();
                setOverlay(null);
              }
            }}
          >
            Сбросить прогресс
          </button>
        </div>
      </div>
    </Modal>
  );
}
