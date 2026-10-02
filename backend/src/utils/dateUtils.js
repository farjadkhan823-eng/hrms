const pad = (n) => String(n).padStart(2, '0');

// today's date as YYYY-MM-DD (server local time)
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// "2026-10-02" -> Date at UTC midnight (matches @db.Date column)
const toDateOnly = (str) => new Date(str + 'T00:00:00.000Z');

module.exports = { todayStr, toDateOnly };
