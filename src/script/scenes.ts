import type { Scene, SceneId, SectionId } from '../engine/types';

/** Order of the résumé sections on the hub. */
export const sectionOrder: SectionId[] = ['about', 'skills', 'practice', 'interests', 'hobby', 'goal'];

const ME = 'metaxxd';

const raw: Record<SceneId, Scene> = {
  prologue: {
    id: 'prologue',
    title: 'Прибытие',
    bg: 'bus_day',
    mood: 'day',
    lines: [
      { text: 'Автобус сворачивает с асфальта и медленно ползёт к воротам летнего лагеря.' },
      { text: 'Двери открываются, пахнет соснами, костром и чем-то подозрительно похожим на кофе.' },
      { who: ME, text: 'Добро пожаловать на мою страничку ♡', bg: 'square_day' },
      { who: ME, text: 'Я студентка 3 курса. Спрашивайте о чём угодно — варианты появятся на экране.' },
      { who: ME, text: 'А если что-то странное — это не баг, а фича.' },
    ],
  },

  about: {
    id: 'about',
    title: 'О себе',
    bg: 'house_day',
    mood: 'day',
    lines: [
      { who: ME, text: 'Начну с самого скучного — документов.' },
      { text: 'Студентка 3 курса ЕНУ им. Л. Н. Гумилёва, специальность ВТиПО.' },
      { text: 'Интересуюсь информационной безопасностью и системным администрированием, решаю CTF.' },
      { text: 'Подозреваю, что баги появляются, когда на них долго смотреть — но продолжаю смотреть.' },
    ],
  },

  skills: {
    id: 'skills',
    title: 'Навыки',
    bg: 'club_day',
    mood: 'day',
    lines: [
      { who: ME, text: 'А теперь то, чем руки и голова занимаются.' },
      { text: '[[C]], [[C++]], [[C#]], [[Java]] (пишу, компилирую, смотрю на ошибки с уважением).' },
      { text: '[[SQL]] — PostgreSQL, MS SQL Server (SELECT * знаю, DROP TABLE — пока нет повода).' },
      { text: '[[Linux]] — NixOS как основная система, Arch Linux на домашнем сервере (кстати, я использую NixOS, да).' },
      { text: 'Сети — [[SSH]], туннелирование ([[ngrok]], [[Cloudflare Tunnel]]), анализ трафика в [[Wireshark]] (пакеты как люди — интересны только чужие).' },
      { text: '[[Arduino]] и [[ESP32]], курсы по Raspberry Pi (паяю, изредка успешно).' },
      { text: 'Основы ИБ и CTF.' },
      { text: '[[Claude Code]] в разработке (помощник, который не отлынивает).' },
    ],
  },

  practice: {
    id: 'practice',
    title: 'Практика',
    bg: 'workshop',
    mood: 'day',
    lines: [
      { who: ME, text: 'Это уже руками, а не в конспектах.' },
      { text: '[[CTF]], одиночное участие (команда молчит, флаг сам не возьмёт).' },
      { text: '[[ESP32]]-проекты: умный дом, мини-игры на OLED SSD1306, учебный стенд Evil Twin — на собственной сети, всё легально, обещаю.' },
      { text: 'Домашний сервер [[Arch]] с доступом по SSH через туннели (работает, пока не трогаю).' },
      { text: 'Хакатоны — люблю формат, где дедлайн лечит перфекционизм.' },
    ],
  },

  interests: {
    id: 'interests',
    title: 'Интересы',
    bg: 'beach_sunset',
    mood: 'sunset',
    lines: [
      { who: ME, text: 'А вот что меня реально цепляет.' },
      { text: '[[ИБ]] (SOC, пентест) — хочу знать, как ломается, прежде чем защищать.' },
      { text: '[[системное администрирование]] — нравится, когда всё работает по расписанию, а не по настроению.' },
      { text: '[[reverse engineering]] (открыть, посмотреть на асм, закрыть с уважением).' },
      { text: '[[OSINT]] (интернет ничего не забывает — это и пугает, и восхищает).' },
      { text: '[[электроника]] (два ESP32 есть, паяльник тоже).' },
    ],
  },

  hobby: {
    id: 'hobby',
    title: 'Хобби',
    bg: 'beach_night',
    mood: 'night',
    lines: [
      { who: ME, text: 'Ну а это уже для души.' },
      { text: 'Смотреть на системы, пока они не признаются в уязвимости.' },
      { text: 'Wireshark как мини-матрица — всё течёт, всё пакуется.' },
      { text: 'Разборы CTF-тасков (иногда с решением, иногда с уважением к автору).' },
    ],
  },

  goal: {
    id: 'goal',
    title: 'Цель',
    bg: 'road_dusk',
    mood: 'dawn',
    lines: [
      { who: ME, text: 'И последнее — куда всё это движется.' },
      { text: 'Стажировка в ИБ или системном администрировании.' },
      { text: 'Такая, где можно трогать реальные системы, и это не считается вредительством.' },
    ],
  },

  ending: {
    id: 'ending',
    title: 'Финал',
    bg: 'road_dusk',
    mood: 'dawn',
    lines: [
      { who: ME, text: 'Спасибо, что заглянули в гости <3' },
      { text: 'Контакты лежат в меню, если захочется написать.' },
      { who: ME, text: 'Ломаю systems, а не людей.' },
    ],
  },

  secret: {
    id: 'secret',
    title: 'Секрет',
    bg: 'square_night',
    mood: 'night',
    lines: [
      { text: '★ HACK MODE UNLOCKED ★' },
      { who: ME, text: 'Konami-код принят. Да, тот самый, ↑↑↓↓←→←→ B A. Респект ♡' },
      { who: ME, text: 'Всё, что тут «взломано», — легально и существует только в пикселях, обещаю.' },
    ],
  },
};

/** Résumé sections are spoken by her from start to finish, so every line gets the name plate. */
export const scenes = Object.fromEntries(
  Object.entries(raw).map(([id, scene]) => [
    id,
    sectionOrder.includes(id as SectionId)
      ? { ...scene, lines: scene.lines.map((line) => ({ ...line, who: line.who ?? ME })) }
      : scene,
  ]),
) as Record<SceneId, Scene>;
