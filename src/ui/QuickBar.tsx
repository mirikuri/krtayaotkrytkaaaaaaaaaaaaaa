import { useGame } from '../engine/store';

export default function QuickBar() {
  const auto = useGame((s) => s.auto);
  const skipping = useGame((s) => s.skipping);
  const back = useGame((s) => s.back);
  const toggleAuto = useGame((s) => s.toggleAuto);
  const toggleSkip = useGame((s) => s.toggleSkip);
  const setOverlay = useGame((s) => s.setOverlay);
  const openScreen = useGame((s) => s.openScreen);
  const goMenu = useGame((s) => s.goMenu);

  const items: { label: string; onClick: () => void; pressed?: boolean }[] = [
    { label: 'Назад', onClick: back },
    { label: 'История', onClick: () => setOverlay('backlog') },
    { label: 'Авто', onClick: toggleAuto, pressed: auto },
    { label: 'Пропуск', onClick: toggleSkip, pressed: skipping },
    { label: 'Настройки', onClick: () => setOverlay('settings') },
    { label: 'Резюме', onClick: () => openScreen('cv') },
    { label: 'Меню', onClick: goMenu },
  ];

  return (
    // Clicks on the bar must not reach the scene (which advances the text).
    <nav className="quickbar" aria-label="Быстрые действия" onClick={(e) => e.stopPropagation()}>
      {items.map((it) => (
        <button
          key={it.label}
          type="button"
          className="qb"
          onClick={it.onClick}
          aria-pressed={it.pressed}
        >
          {it.label}
        </button>
      ))}
    </nav>
  );
}
