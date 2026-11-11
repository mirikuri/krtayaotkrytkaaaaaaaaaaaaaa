import type { Contact, GalleryItem, ProfileSection } from '../engine/types';

/** Single source of truth for the résumé text. Keywords are marked as [[word]]. */
export const sections: ProfileSection[] = [
  {
    id: 'about',
    title: 'О себе',
    body: 'Студентка 3 курса ЕНУ им. Л. Н. Гумилёва, специальность ВТиПО. Интересуюсь информационной безопасностью и системным администрированием, решаю CTF. Подозреваю, что баги появляются, когда на них долго смотреть — но продолжаю смотреть.',
  },
  {
    id: 'skills',
    title: 'Навыки',
    body: '[[C]], [[C++]], [[C#]], [[Java]] (пишу, компилирую, смотрю на ошибки с уважением), [[SQL]] — PostgreSQL, MS SQL Server (SELECT * знаю, DROP TABLE — пока нет повода), [[Linux]] — NixOS как основная система, Arch Linux на домашнем сервере (кстати, я использую NixOS, да), сети — [[SSH]], туннелирование ([[ngrok]], [[Cloudflare Tunnel]]), анализ трафика в [[Wireshark]] (пакеты как люди — интересны только чужие), [[Arduino]] и [[ESP32]], курсы по Raspberry Pi (паяю, изредка успешно), основы ИБ и CTF, [[Claude Code]] в разработке (помощник, который не отлынивает)',
  },
  {
    id: 'practice',
    title: 'Практика',
    body: '[[CTF]], одиночное участие (команда молчит, флаг сам не возьмёт); [[ESP32]]-проекты: умный дом, мини-игры на OLED SSD1306, учебный стенд Evil Twin — на собственной сети, всё легально, обещаю; домашний сервер [[Arch]] с доступом по SSH через туннели (работает, пока не трогаю); хакатоны — люблю формат, где дедлайн лечит перфекционизм',
  },
  {
    id: 'interests',
    title: 'Интересы',
    body: '[[ИБ]] (SOC, пентест) — хочу знать, как ломается, прежде чем защищать; [[системное администрирование]] — нравится, когда всё работает по расписанию, а не по настроению; [[reverse engineering]] (открыть, посмотреть на асм, закрыть с уважением); [[OSINT]] (интернет ничего не забывает — это и пугает, и восхищает); [[электроника]] (два ESP32 есть, паяльник тоже)',
  },
  {
    id: 'hobby',
    title: 'Хобби',
    body: 'Смотреть на системы, пока они не признаются в уязвимости; Wireshark как мини-матрица — всё течёт, всё пакуется; разборы CTF-тасков (иногда с решением, иногда с уважением к автору)',
  },
  {
    id: 'goal',
    title: 'Цель',
    body: 'Стажировка в ИБ или системном администрировании, где можно трогать реальные системы и это не считается вредительством',
  },
];

export const contacts: Contact[] = [
  { label: 'github', href: 'https://github.com/mirikuri' },
  { label: '@metaxxd', href: 'https://t.me/metaxxd' },
];

export const gallery: GalleryItem[] = [
  {
    src: 'https://i.pinimg.com/736x/68/6b/74/686b74cac9d7f380243d3cbac52e377f.jpg',
    alt: 'Код и кофе',
    caption: 'код не мой',
  },
  {
    src: 'https://i.pinimg.com/736x/9a/28/21/9a2821955ae5503192ba4531cafce5b0.jpg',
    alt: 'ESP',
    caption: 'еспшка не моя',
  },
  {
    src: 'https://i.pinimg.com/1200x/f9/b6/cd/f9b6cd80b87e2394769057efd01fd75c.jpg',
    alt: 'CTF',
    caption: 'CTF и хаос',
  },
  {
    src: 'https://i.pinimg.com/736x/0e/04/b1/0e04b13cefbee6ac993fb0a0d6140593.jpg',
    alt: 'Linux',
    caption: 'линух эстетика',
  },
];

export const credits =
  'Фоны и спрайт Лены — визуальная новелла «Бесконечное лето» © Soviet Games, лицензия CC BY-NC-SA 4.0. Сайт некоммерческий.';
export const creditsUrl = 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.ru';
