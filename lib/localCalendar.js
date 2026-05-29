const DAY_MS = 24 * 60 * 60 * 1000;

const seasons = {
  spring: {
    slug: "spring",
    name: "Musim Semi",
    shortName: "Semi",
    months: [2, 3, 4],
    accent: "#e65788",
    temperature: [23, 31],
    weather: ["Cerah Bunga", "Mendung Tipis", "Gerimis", "Kabut Pagi", "Angin Kelopak"],
    images: [
      { path: "/seasons/spring.png", label: "Danau Sakura", overlay: "sunrise", particle: "petal" },
      { path: "/seasons/spring-2.png", label: "Taman Hujan", overlay: "rain", particle: "drop" },
      { path: "/seasons/spring-3.png", label: "Padang Bunga", overlay: "glow", particle: "spark" },
      { path: "/seasons/spring-4.png", label: "Senja Sakura", overlay: "moon", particle: "star" }
    ]
  },
  summer: {
    slug: "summer",
    name: "Musim Panas",
    shortName: "Panas",
    months: [5, 6, 7],
    accent: "#f5b840",
    temperature: [27, 36],
    weather: ["Cerah Terik", "Langit Biru", "Berawan", "Angin Laut", "Panas Lembut"],
    images: [
      { path: "/seasons/summer.png", label: "Pantai Cerah", overlay: "glow", particle: "spark" },
      { path: "/seasons/summer-2.png", label: "Bunga Tropis", overlay: "sunrise", particle: "petal" },
      { path: "/seasons/summer-3.png", label: "Senja Danau", overlay: "sunset", particle: "star" },
      { path: "/seasons/summer-4.png", label: "Lembah Sungai", overlay: "cloud", particle: "spark" }
    ]
  },
  autumn: {
    slug: "autumn",
    name: "Musim Gugur",
    shortName: "Gugur",
    months: [8, 9, 10],
    accent: "#dc7440",
    temperature: [20, 29],
    weather: ["Daun Jatuh", "Kabut Emas", "Mendung Hangat", "Angin Gugur", "Gerimis Daun"],
    images: [
      { path: "/seasons/autumn.png", label: "Danau Maple", overlay: "sunset", particle: "leaf" },
      { path: "/seasons/autumn-2.png", label: "Kolam Kabut", overlay: "mist", particle: "leaf" },
      { path: "/seasons/autumn-3.png", label: "Jalan Emas", overlay: "glow", particle: "leaf" },
      { path: "/seasons/autumn-4.png", label: "Hujan Gugur", overlay: "rain", particle: "drop" }
    ]
  },
  winter: {
    slug: "winter",
    name: "Musim Dingin",
    shortName: "Dingin",
    months: [11, 0, 1],
    accent: "#78aeea",
    temperature: [8, 19],
    weather: ["Salju Halus", "Cerah Beku", "Kabut Es", "Berawan Dingin", "Angin Salju"],
    images: [
      { path: "/seasons/winter.png", label: "Danau Beku", overlay: "mist", particle: "dot" },
      { path: "/seasons/winter-2.png", label: "Hutan Salju", overlay: "snow", particle: "star" },
      { path: "/seasons/winter-3.png", label: "Bulan Es", overlay: "moon", particle: "star" },
      { path: "/seasons/winter-4.png", label: "Taman Beku", overlay: "cloud", particle: "dot" }
    ]
  }
};

const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];
const monthShort = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
export function buildCalendar({ year, month, selectedDate }) {
  const normalizedYear = Number.isInteger(year) ? year : new Date().getFullYear();
  const normalizedMonth = Number.isInteger(month) ? clamp(month, 1, 12) : new Date().getMonth() + 1;
  const selected = selectedDate ? parseDate(selectedDate) : todayUtc();
  const first = makeDate(normalizedYear, normalizedMonth - 1, 1);
  const leadingDays = (first.getUTCDay() + 6) % 7;
  const gridStart = addDays(first, -leadingDays);
  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return buildDay(date, {
      selectedDate: toIso(selected),
      currentMonth: normalizedMonth - 1
    });
  });

  return {
    year: normalizedYear,
    month: normalizedMonth,
    monthName: monthNames[normalizedMonth - 1],
    monthShort: monthShort[normalizedMonth - 1],
    weekdayLabels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    selectedDay: buildDay(selected, {
      selectedDate: toIso(selected),
      currentMonth: selected.getUTCMonth()
    }),
    weeks: chunk(cells, 7)
  };
}

export function buildDay(date, options = {}) {
  const iso = toIso(date);
  const season = getSeason(date);
  const imageIndex = dateHash(date, "image") % season.images.length;
  const image = season.images[imageIndex];
  const weatherName = season.weather[dateHash(date, "weather") % season.weather.length];
  const temperature = getTemperature(date, season);

  return {
    iso,
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
    weekday: date.getUTCDay(),
    dayName: dayNames[date.getUTCDay()],
    isToday: iso === toIso(todayUtc()),
    isSelected: iso === options.selectedDate,
    inCurrentMonth: options.currentMonth === undefined ? true : date.getUTCMonth() === options.currentMonth,
    season: {
      slug: season.slug,
      name: season.name,
      shortName: season.shortName,
      accent: season.accent
    },
    weather: {
      name: weatherName,
      icon: getWeatherIcon(weatherName),
      temperature
    },
    moon: getMoonPhase(date),
    artwork: {
      base: image.path,
      variant: `foto-${imageIndex + 1}`,
      variantName: image.label,
      overlay: image.overlay,
      particle: image.particle
    }
  };
}

function getSeason(date) {
  const month = date.getUTCMonth();
  return Object.values(seasons).find((season) => season.months.includes(month)) ?? seasons.spring;
}

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return todayUtc();
  const [year, month, day] = value.split("-").map(Number);
  return makeDate(year, month - 1, day);
}

function getTemperature(date, season) {
  const [min, max] = season.temperature;
  return min + (dateHash(date, "temp") % (max - min + 1));
}

function getWeatherIcon(name) {
  if (name.includes("Gerimis") || name.includes("Rintik")) return "rain";
  if (name.includes("Kabut")) return "mist";
  if (name.includes("Salju")) return "snow";
  if (name.includes("Mendung") || name.includes("Berawan")) return "cloud";
  if (name.includes("Bulan")) return "moon";
  return "sun";
}

function getMoonPhase(date) {
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const age = ((date.getTime() - knownNewMoon) / DAY_MS) % 29.53058867;
  const normalizedAge = age < 0 ? age + 29.53058867 : age;
  const phases = [
    [1.84566, "Bulan Baru", "new"],
    [5.53699, "Sabit Muda", "waxing-crescent"],
    [9.22831, "Kuartal Awal", "first-quarter"],
    [12.91963, "Cembung Muda", "waxing-gibbous"],
    [16.61096, "Purnama", "full"],
    [20.30228, "Cembung Tua", "waning-gibbous"],
    [23.99361, "Kuartal Akhir", "last-quarter"],
    [27.68493, "Sabit Tua", "waning-crescent"],
    [29.53059, "Bulan Baru", "new"]
  ];
  const phase = phases.find(([limit]) => normalizedAge < limit) ?? phases[0];

  return {
    age: Number(normalizedAge.toFixed(1)),
    name: phase[1],
    icon: phase[2]
  };
}

function dateHash(date, salt) {
  const text = `${toIso(date)}-${salt}`;
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function todayUtc() {
  const now = new Date();
  return makeDate(now.getFullYear(), now.getMonth(), now.getDate());
}

function makeDate(year, month, day) {
  return new Date(Date.UTC(year, month, day));
}

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

function toIso(date) {
  return date.toISOString().slice(0, 10);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}
