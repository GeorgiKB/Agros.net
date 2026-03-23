import { writeFileSync } from 'fs';

const products = [
  {
    slug: 'natural-750ml',
    image: '../images/olleo/natural.png',
    name: 'Студено пресовано слънчогледово олио',
    size: '750 мл',
    price: '8.96',
    sku: '',
    ingredients: 'Студено пресовани обелени слънчогледови ядки (100% Българско).',
    description: 'Студено пресовано от български обелени слънчогледови ядки, фина филтрация, без химична обработка. Температура на екстракция ≤45°C. Богато на Омега 3, 6, 9 мастни киселини, Витамини Е, А, Д, цинк и калий. Запазва богатия аромат и вкус на слънчоглед.',
    usage: 'Подходящо за салати, сосове, супи, зеленчукови кремове, месо и риба. Не е подходящо за пържене, варене или печене. При температури под 20°C може да се появи утайка — нормален процес, не влияе на качеството.',
    storage: 'Да се съхранява на сухо, хладно място, далеч от пряка слънчева светлина.',
  },
  {
    slug: 'lemon-250ml',
    image: '../images/olleo/lemon.png',
    name: 'Слънчогледово олио с лимон',
    size: '250 мл',
    price: '4.79',
    sku: '',
    ingredients: 'Студено пресовани обелени български слънчогледови ядки, есенциално масло от лимон.',
    description: 'Студено пресовано от 100% български слънчоглед, обогатено с есенциално масло от лимон. Богато на Омега 3, 6, 9 мастни киселини, Витамини Е, А, Д, цинк и калий. Освежаващ цитрусов аромат.',
    usage: 'Подходящо за салати, сосове, супи, зеленчукови кремове, месо и риба. Не е подходящо за пържене, варене или печене.',
    storage: 'Да се съхранява на сухо, хладно място, далеч от пряка слънчева светлина.',
  },
  {
    slug: 'chilli-250ml',
    image: '../images/olleo/chilli.png',
    name: 'Слънчогледово олио с чили',
    size: '250 мл',
    price: '4.79',
    sku: '',
    ingredients: 'Студено пресовани обелени български слънчогледови ядки, есенциално масло от прясно смлени семена на люта чушка.',
    description: 'Студено пресовано от български слънчогледови семена, с добавено чили масло. Температура на екстракция ≤45°C. Богато на Омега 3, 6, 9 мастни киселини, Витамини Е, А, Д, цинк и калий. Пикантен характер с мек топлинен финал.',
    usage: 'Подходящо за салати, сосове, супи, зеленчукови кремове, месо и риба. Не е подходящо за пържене, варене или печене.',
    storage: 'Да се съхранява на сухо, хладно място, далеч от пряка слънчева светлина.',
  },
  {
    slug: 'garlic-250ml',
    image: '../images/olleo/garlic.png',
    name: 'Слънчогледово олио с чесън',
    size: '250 мл',
    price: '4.79',
    sku: '',
    ingredients: 'Студено пресовани обелени български слънчогледови ядки, есенциално масло от чесън.',
    description: 'Студено пресовано от 100% български слънчоглед, с добавено есенциално масло от чесън. Фина филтрация, без химична обработка. Богато на Омега 3, 6, 9 мастни киселини, Витамини Е, А, Д, цинк и калий.',
    usage: 'Подходящо за салати, сосове, супи, зеленчукови кремове, месо и риба. Не е подходящо за пържене, варене или печене.',
    storage: 'Да се съхранява на сухо, хладно място, далеч от пряка слънчева светлина.',
  },
  {
    slug: 'coriander-250ml',
    image: '../images/olleo/coriander-oil.png',
    name: 'Кориандрово масло',
    size: '250 мл',
    price: '21.01',
    sku: '',
    ingredients: 'Семена от кориандър (100% Българско).',
    description: 'Извлечено от семена на кориандър — суперхрана с изключителни свойства. Притежава противовъзпалително, антибактериално и антигъбично действие. Подпомага детоксикацията на черния дроб, облекчава болки в ставите и мускулите, подпомага кожата при акне и дерматит, подобрява кръвообращението, храносмилането и регулира кръвната захар.',
    usage: 'Кулинарно приложение: за салати и студени ястия.外ernal приложение: ароматерапия, масаж, гаргара, компреси, вани, сауна. Не е подходящо за термична обработка.',
    storage: 'Да се съхранява на сухо, хладно място, далеч от пряка слънчева светлина.',
  },
  {
    slug: 'flax-250ml',
    image: '../images/olleo/flax-oil.png',
    name: 'Ленено масло студено пресовано',
    size: '250 мл',
    price: '5.81',
    sku: '',
    ingredients: 'Ленено семе (100% Българско).',
    description: 'Студено пресовано ленено масло — суперхрана с изключителни свойства. Притежава противовъзпалително, антибактериално и антигъбично действие. Подпомага детоксикацията на черния дроб, облекчава болки в ставите и мускулите, грижи се за кожата при акне и дерматит, подобрява кръвообращението, храносмилането и регулира кръвната захар.',
    usage: 'За вътрешна и外erna употреба: за салати и студени ястия. Не е подходящо за пържене.',
    storage: 'Да се съхранява на сухо, хладно място, далеч от пряка слънчева светлина.',
  },
  {
    slug: 'truffle-250ml',
    image: '../images/olleo/trufel.png',
    name: 'Слънчогледово олио с трюфел',
    size: '250 мл',
    price: '9.80',
    sku: '',
    ingredients: 'Студено пресовани обелени слънчогледови семена, масло от трюфел.',
    description: 'Студено пресовано българско слънчогледово олио с аромат на трюфел за гурме употреба. Богато на Омега 3, 6, 9 мастни киселини, Витамини Е, А, Д, цинк и калий. Изисканото присъствие на трюфел издига всяко ястие на ново ниво.',
    usage: 'Подходящо за салати, сосове, супи, зеленчукови кремове, месо и риба. Не е подходящо за пържене, варене или печене.',
    storage: 'Да се съхранява на сухо, хладно място, далеч от пряка слънчева светлина.',
  },
  {
    slug: 'olive-blend-250ml',
    image: '../images/olleo/olive-oil.png',
    name: 'Олио с Extra Virgin зехтин (50/50)',
    size: '250 мл',
    price: '6.20',
    sku: '',
    ingredients: 'Студено пресовани обелени слънчогледови ядки, Extra Virgin зехтин.',
    description: 'Смес в равни пропорции от студено пресовано българско слънчогледово олио и Extra Virgin зехтин. Богато на Омега 3, 6, 9 мастни киселини, Витамини Е, А, Д, цинк и калий. Съчетава ползите на два изключителни натурални продукта.',
    usage: 'Подходящо за салати, сосове, супи, зеленчукови кремове, месо и риба. Не е подходящо за пържене, варене или печене.',
    storage: 'Да се съхранява на сухо, хладно място, далеч от пряка слънчева светлина.',
  },
  {
    slug: 'omega-mix-250ml',
    image: '../images/olleo/omega-mix.png',
    name: 'Омега микс студено пресовано',
    size: '250 мл',
    price: '6.90',
    sku: 'OL-001',
    ingredients: 'Обелени слънчогледови ядки, масло от орех, ленено масло.',
    description: 'Студено пресована смес от български слънчоглед, орехово и ленено масло. Богато на Омега 3, 6, 9 мастни киселини, Витамини Е, А, Д, цинк и калий. Богат слънчогледов аромат с дълбочина от ореховото масло.',
    usage: 'Подходящо за салати, сосове, супи, зеленчукови кремове, месо и риба. Не е подходящо за пържене, варене или печене.',
    storage: 'Да се съхранява на сухо, хладно място, далеч от пряка слънчева светлина.',
  },
  {
    slug: 'lemon-8ml',
    image: '../images/olleo/lemon-8ml.png',
    name: 'Студено пресовано олио с лимон',
    size: '8 мл',
    price: '0.39',
    sku: '',
    ingredients: 'Студено пресовано обелено българско слънчогледово олио, есенциално масло от лимон.',
    description: 'Същият процес на студено пресоване, обогатен с есенциално масло от лимон. Богато на Омега 3, 6, 9, Витамини Е, А, Д, цинк и калий. Удобен формат сашет за заведения, офиси и пътуване.',
    usage: 'Подходящо за салати, сосове, супи, зеленчукови кремове, месо и риба. Не е подходящо за пържене, варене или печене.',
    storage: 'Да се съхранява на сухо, хладно място, далеч от пряка слънчева светлина.',
  },
  {
    slug: 'chilli-8ml',
    image: '../images/olleo/chilli-8ml.png',
    name: 'Студено пресовано олио с чили',
    size: '8 мл',
    price: '0.39',
    sku: '',
    ingredients: 'Студено пресовано обелено българско слънчогледово олио, есенциално масло от прясно смлени семена на люта чушка.',
    description: 'Студено пресовано от български слънчогледови семена, с добавено чили масло. Температура ≤45°C. Богато на Омега 3, 6, 9, Витамини Е, А, Д, цинк и калий. Удобен сашет за заведения, офиси и пътуване.',
    usage: 'Подходящо за салати, сосове, супи, зеленчукови кремове, месо и риба. Не е подходящо за пържене, варене или печене.',
    storage: 'Да се съхранява на сухо, хладно място, далеч от пряка слънчева светлина.',
  },
  {
    slug: 'garlic-8ml',
    image: '../images/olleo/garlic-8ml.png',
    name: 'Студено пресовано олио с чесън',
    size: '8 мл',
    price: '0.39',
    sku: '',
    ingredients: 'Студено пресовано обелено българско слънчогледово олио, есенциално масло от чесън.',
    description: 'Студено пресовано от 100% български суровини, с есенциално масло от чесън. Богато на Омега 3, 6, 9, Витамини Е, А, Д, цинк и калий. Удобен сашет за заведения, офиси и пътуване.',
    usage: 'Подходящо за салати, сосове, супи, зеленчукови кремове, месо и риба. Не е подходящо за пържене, варене или печене.',
    storage: 'Да се съхранява на сухо, хладно място, далеч от пряка слънчева светлина.',
  },
  {
    slug: 'balsamic-8ml',
    image: '../images/olleo/balsamic-8ml.png',
    name: 'Балсамов оцет',
    size: '8 мл',
    price: '0.39',
    sku: '',
    ingredients: 'Балсамов оцет.',
    description: 'Богат източник на антиоксиданти и биофлавоноиди. Редовната употреба допринася за намаляване на риска от сърдечносъдови заболявания, диабет, инсулт и болестта на Алцхаймер, и помага за регулиране на кръвното налягане.',
    usage: 'За салати, дресинги, маринати и всякакви студени ястия.',
    storage: 'Да се съхранява на сухо, хладно място, далеч от пряка слънчева светлина.',
  },
  {
    slug: 'soy-8ml',
    image: '../images/olleo/soy-8ml.png',
    name: 'Соев сос',
    size: '8 мл',
    price: '0.39',
    sku: '',
    ingredients: 'Соев сос.',
    description: 'Богат на протеини и въглехидрати. Съдържа около 38% от препоръчителния дневен прием на сол на порция. Класически умами вкус за обогатяване на всяко ястие.',
    usage: 'За суши, wok, маринати, дресинги и азиатска кухня.',
    storage: 'Да се съхранява на сухо, хладно място, далеч от пряка слънчева светлина.',
  },
  {
    slug: 'natural-14ml',
    image: '../images/olleo/natural-8ml.png',
    name: 'Студено пресовано слънчогледово олио',
    size: '14 мл',
    price: '0.49',
    sku: '',
    ingredients: 'Студено пресовано масло от обелен български слънчоглед.',
    description: 'Извлечено от български обелени слънчогледови семена чрез студено пресоване и фина филтрация, без химична обработка. Температура на екстракция ≤45°C. Съдържа Омега 3, 6, 9 мастни киселини, Витамини Е, А, Д, цинк и калий. При температури под 20°C може да се появи утайка — нормален процес.',
    usage: 'Подходящо за салати, сосове, супи, зеленчукови кремове, месо и риба. Не е подходящо за пържене, варене или печене.',
    storage: 'Да се съхранява на сухо, хладно място, далеч от пряка слънчева светлина.',
  },
  {
    slug: 'doses-10x8ml',
    image: '../images/olleo/doses.png',
    name: 'OLLEO пликчета с дози',
    size: '10 × 8 мл',
    price: '4.50',
    sku: '',
    ingredients: '100% натурални съставки, без изкуствени добавки.',
    description: '10 сашета от един вид студено пресовано олио или сос. Налични варианти: студено пресовано слънчогледово олио с чесън, с чили, с лимон, соев сос или балсамов оцет. Удобен портативен формат за вкъщи, офис или пътуване.',
    usage: 'Подходящо за салати, сосове, супи, зеленчукови кремове, месо и риба. Не е подходящо за пържене, варене или печене.',
    storage: 'Да се съхранява на сухо, хладно място, далеч от пряка слънчева светлина.',
  },
];

function page(p) {
  return `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${p.name} ${p.size} — OLLEO | Agros</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            forest: { 50:'#EEF2EB', 100:'#D7E4D4', 200:'#B0CAAD', 300:'#82B27F', 400:'#6C9C6A', 500:'#5F7E5F', 600:'#506E4E', 700:'#416241', 800:'#344B34', 900:'#2F412E' },
            cream:  { 50:'#FEFCF8', 100:'#F7F3EC', 200:'#EDE5D5', 300:'#DDD0BC' },
            honey:  { 300:'#F0C96A', 400:'#E4A94A', 500:'#C8922A', 600:'#A97520', 700:'#9B6C14' },
          },
          fontFamily: {
            display: ['"Playfair Display"', 'Georgia', 'serif'],
            body:    ['Inter', 'system-ui', 'sans-serif'],
          },
        },
      },
    };
  </script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; background-color: #F7F3EC; color: #1A1A1A; }
    h1, h2, h3, .font-display { font-family: 'Playfair Display', Georgia, serif; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #F7F3EC; }
    ::-webkit-scrollbar-thumb { background: #5F7E5F; border-radius: 4px; }
    .nav-link { position: relative; }
    .nav-link::after { content:''; position:absolute; bottom:-3px; left:0; width:0; height:1.5px; background:#C8922A; transition:width 0.25s ease; }
    .nav-link:hover::after, .nav-link:focus-visible::after { width:100%; }
    .btn { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease, background-color 0.2s ease; }
    .btn:hover  { transform: translateY(-1px); }
    .btn:active { transform: translateY(0px); opacity: 0.9; }
    html { scroll-behavior: smooth; }
  </style>
</head>
<body>

  <!-- Announcement bar -->
  <div class="bg-forest-700 text-cream-100 text-center py-2.5 text-xs font-body tracking-wide" style="letter-spacing:0.04em;">
    🌿&nbsp; Безплатна доставка при поръчки над&nbsp;<strong>50 лв.</strong>&nbsp;&nbsp;·&nbsp;&nbsp;Произведено в България от Agros&nbsp;98
  </div>

  <!-- Nav -->
  <nav class="sticky top-0 z-50 bg-cream-50/95 backdrop-blur-md border-b border-cream-200"
       style="box-shadow: 0 1px 0 rgba(65,98,65,0.06), 0 4px 24px rgba(65,98,65,0.05);">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
      <div class="flex items-center justify-between h-16">
        <a href="../index.html" class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 rounded-lg">
          <img src="../images/agros-logo.png" alt="Agros" class="h-10 w-auto" />
        </a>
        <div class="hidden md:flex items-center gap-7">
          <a href="../index.html#products" class="nav-link text-sm font-body font-medium text-gray-600 hover:text-forest-800 transition-colors duration-200 focus-visible:outline-none">Продукти</a>
          <a href="../index.html#brands"   class="nav-link text-sm font-body font-medium text-gray-600 hover:text-forest-800 transition-colors duration-200 focus-visible:outline-none">Марки</a>
          <a href="../index.html#about"    class="nav-link text-sm font-body font-medium text-gray-600 hover:text-forest-800 transition-colors duration-200 focus-visible:outline-none">За нас</a>
          <a href="../index.html#contact"  class="nav-link text-sm font-body font-medium text-gray-600 hover:text-forest-800 transition-colors duration-200 focus-visible:outline-none">Контакти</a>
        </div>
        <div class="flex items-center gap-1">
          <button class="relative p-2.5 rounded-full hover:bg-forest-50 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400" aria-label="Количка">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-honey-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">0</span>
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Breadcrumb -->
  <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-6 pb-2">
    <nav class="flex items-center gap-2 text-xs font-body text-gray-400" aria-label="Breadcrumb">
      <a href="../index.html" class="hover:text-forest-700 transition-colors duration-200">Начало</a>
      <span>/</span>
      <a href="../index.html#products" class="hover:text-forest-700 transition-colors duration-200">Продукти</a>
      <span>/</span>
      <span class="text-forest-700 font-medium">OLLEO</span>
      <span>/</span>
      <span class="text-gray-600 truncate max-w-[200px]">${p.name}</span>
    </nav>
  </div>

  <!-- Product section -->
  <main class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

      <!-- Image -->
      <div class="rounded-2xl overflow-hidden flex items-center justify-center"
           style="background:#EEF2EB; min-height:420px; box-shadow: 0 4px 30px rgba(65,98,65,0.10), 0 1px 6px rgba(0,0,0,0.05);">
        <img src="${p.image}" alt="${p.name} ${p.size}" class="w-full h-full object-contain p-8" style="max-height:520px;" />
      </div>

      <!-- Info -->
      <div class="flex flex-col gap-6 pt-2">

        <!-- Brand badge -->
        <span class="inline-flex w-fit items-center gap-1.5 bg-forest-700 text-cream-50 text-[11px] font-body font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">OLLEO</span>

        <!-- Name -->
        <div>
          <h1 class="font-display font-bold text-forest-900 leading-tight mb-2"
              style="font-size: clamp(1.6rem, 3vw, 2.4rem); letter-spacing:-0.02em;">${p.name}</h1>
          <p class="text-gray-400 font-body text-sm">${p.size}${p.sku ? ' &nbsp;·&nbsp; SKU: ' + p.sku : ''}</p>
        </div>

        <!-- Price -->
        <div class="flex items-baseline gap-3">
          <span class="font-body font-bold text-forest-800" style="font-size:2rem;">${p.price}&nbsp;лв.</span>
        </div>

        <!-- Add to cart -->
        <div class="flex flex-wrap gap-3">
          <button class="btn flex items-center gap-2.5 text-white font-body font-semibold px-8 py-3.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-300"
                  style="background:#C8922A; box-shadow: 0 4px 20px rgba(200,146,42,0.40), 0 1px 4px rgba(200,146,42,0.20);">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Добави в количка
          </button>
          <a href="../index.html#products"
             class="btn flex items-center gap-2 font-body font-medium px-6 py-3.5 rounded-full border border-forest-300 text-forest-700 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400">
            ← Обратно
          </a>
        </div>

        <!-- Divider -->
        <div style="border-top:1px solid #EDE5D5; margin:4px 0;"></div>

        <!-- Description -->
        <div>
          <h2 class="font-display font-semibold text-forest-900 text-lg mb-2">Описание</h2>
          <p class="font-body text-gray-600 leading-relaxed" style="line-height:1.75;">${p.description}</p>
        </div>

        <!-- Ingredients -->
        <div class="rounded-xl p-5" style="background:#EEF2EB;">
          <h2 class="font-display font-semibold text-forest-900 text-base mb-2">Съставки</h2>
          <p class="font-body text-gray-600 text-sm leading-relaxed">${p.ingredients}</p>
        </div>

        <!-- Usage -->
        <div>
          <h2 class="font-display font-semibold text-forest-900 text-base mb-2">Начин на употреба</h2>
          <p class="font-body text-gray-600 text-sm leading-relaxed" style="line-height:1.75;">${p.usage}</p>
        </div>

        <!-- Storage -->
        <div class="flex items-start gap-3 rounded-xl p-4" style="background:#F7F3EC; border:1px solid #EDE5D5;">
          <svg class="w-5 h-5 text-forest-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
          </svg>
          <p class="font-body text-gray-500 text-sm">${p.storage}</p>
        </div>

      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="mt-20 bg-forest-900 text-cream-300">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-12 text-center">
      <img src="../images/agros-logo.png" alt="Agros" class="h-10 w-auto mx-auto mb-4 opacity-80" />
      <p class="font-body text-sm text-cream-300/60">© 2024 Agros 98 ООД. Всички права запазени.</p>
      <p class="font-body text-xs text-cream-300/40 mt-1">гр. Варна, ул. Царевец 36 &nbsp;·&nbsp; +359 888 858 996 &nbsp;·&nbsp; office@agros.net</p>
    </div>
  </footer>

</body>
</html>`;
}

for (const p of products) {
  writeFileSync(`c:/Users/G.Berbenkov/Desktop/Agros.net/products/${p.slug}.html`, page(p));
  console.log(`✓ products/${p.slug}.html`);
}
console.log(`\nGenerated ${products.length} product pages.`);
