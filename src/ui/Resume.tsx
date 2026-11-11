import { useGame } from '../engine/store';
import { sections, contacts } from '../content/profile';
import RichText from './RichText';

export default function Resume() {
  const goMenu = useGame((s) => s.goMenu);

  return (
    <div className="cv">
      <div className="cv-bar">
        <button type="button" className="cv-back" onClick={goMenu}>
          ← В новеллу
        </button>
      </div>

      <article className="cv-sheet">
        <header className="cv-head">
          <img className="cv-avatar" src="/img/avatar.webp" alt="" width={96} height={96} />
          <div>
            <h1 className="cv-name">metaxxd</h1>
            <p className="cv-tag">IT-студентка · ИБ и системное администрирование</p>
          </div>
        </header>

        {sections.map((s) => (
          <section key={s.id} className="cv-section" id={`cv-${s.id}`}>
            <h2>{s.title}</h2>
            {s.body.split(/\n{2,}/).map((para, i) => (
              <p key={i}>
                <RichText text={para} />
              </p>
            ))}
          </section>
        ))}

        <ul className="cv-contacts" aria-label="Контакты">
          {contacts.map((c) => (
            <li key={c.label}>
              <a
                className="cv-contact"
                href={c.href}
                {...(/^https?:/.test(c.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {c.label}
              </a>
            </li>
          ))}
        </ul>

        <footer className="cv-foot">подсказка: попробуй ↑↑↓↓←→←→ B A</footer>
      </article>
    </div>
  );
}
