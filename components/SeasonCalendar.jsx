"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  Plus,
  Save,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buildCalendar } from "../lib/localCalendar";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function SeasonCalendar() {
  const initialDate = useMemo(() => new Date(), []);
  const [selectedIso, setSelectedIso] = useState(toIso(initialDate));
  const [cursor, setCursor] = useState({
    year: initialDate.getFullYear(),
    month: initialDate.getMonth() + 1
  });
  const [calendar, setCalendar] = useState(() =>
    buildCalendar({ year: initialDate.getFullYear(), month: initialDate.getMonth() + 1, selectedDate: toIso(initialDate) })
  );
  const [draft, setDraft] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => setTime(formatTime(new Date())), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadCalendar() {
      try {
        const response = await fetch(
          `${apiUrl}/api/calendar?year=${cursor.year}&month=${cursor.month}&selectedDate=${selectedIso}`,
          { cache: "no-store" }
        );

        if (!response.ok) throw new Error("API tidak tersedia");
        const payload = await response.json();
        if (!ignore) {
          setCalendar(payload);
        }
      } catch {
        if (!ignore) {
          setCalendar(buildCalendar({ year: cursor.year, month: cursor.month, selectedDate: selectedIso }));
        }
      }
    }

    loadCalendar();
    return () => {
      ignore = true;
    };
  }, [cursor.month, cursor.year, selectedIso]);

  const selectedDay = calendar.selectedDay;
  const selectedDescription = selectedDay.description?.content ?? "";
  const pageStyle = {
    "--season-image": `url(${selectedDay.artwork.base})`,
    "--accent": selectedDay.season.accent
  };

  useEffect(() => {
    setDraft(selectedDescription);
    setEditing(false);
    setSaveError("");
  }, [selectedDescription, selectedIso]);

  function shiftMonth(amount) {
    const next = new Date(cursor.year, cursor.month - 1 + amount, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() + 1 });
  }

  function chooseDay(day) {
    setSelectedIso(day.iso);
    setCalendar((current) => selectCalendarDay(current, day));
    setDetailOpen(true);
    if (day.month !== cursor.month || day.year !== cursor.year) {
      setCursor({ year: day.year, month: day.month });
    }
  }

  async function saveDescription() {
    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch(`${apiUrl}/api/day/${selectedIso}/description`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: draft })
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan deskripsi");
      }

      const payload = await response.json();
      setCalendar((current) => updateCalendarDescription(current, payload.date, payload.description));
      setEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Gagal menyimpan deskripsi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      className={`season-page season-${selectedDay.season.slug} overlay-${selectedDay.artwork.overlay} particle-${selectedDay.artwork.particle}`}
      style={pageStyle}
    >
      <div className="scene-bg" aria-hidden="true" />
      <div className="scene-vignette" aria-hidden="true" />
      <div className="particle-field" aria-hidden="true">
        {Array.from({ length: 36 }).map((_, index) => (
          <i key={index} style={{ "--i": index }} />
        ))}
      </div>

      <section className="calendar-shell" aria-label="Kalender musim dan cuaca">
        <aside className="side-stack">
          <div className="glass-panel clock-panel">
            <p className="time">{time}</p>
            <p className="weekday">{selectedDay.dayName},</p>
            <p className="date-line">
              {selectedDay.day} {calendar.monthName} {selectedDay.year}
            </p>
            <div className="mini-row">
              <MoonIcon phase={selectedDay.moon.icon} />
              <span>{selectedDay.moon.name}</span>
            </div>
            <div className="mini-row weather-row">
              <WeatherIcon type={selectedDay.weather.icon} />
              <span>{selectedDay.weather.temperature}°C</span>
            </div>
            <div className="season-chip">
              <CloudSun size={17} />
              <span>{selectedDay.season.name}</span>
            </div>
            {selectedDay.holiday ? (
              <div className="holiday-chip">
                <span>{selectedDay.holiday.type}</span>
                <strong>{selectedDay.holiday.name}</strong>
              </div>
            ) : null}
          </div>
        </aside>

        <section className="glass-panel calendar-panel">
          <header className="calendar-header">
            <button type="button" onClick={() => shiftMonth(-1)} aria-label="Bulan sebelumnya">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1>{calendar.monthShort}</h1>
              <p>{selectedDay.artwork.variantName}</p>
            </div>
            <div className="year-block">
              <strong>{calendar.year}</strong>
              <button type="button" onClick={() => shiftMonth(1)} aria-label="Bulan berikutnya">
                <ChevronRight size={24} />
              </button>
            </div>
          </header>

          <div className="weekday-grid">
            {calendar.weekdayLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="day-grid">
            {calendar.weeks.flat().map((day) => (
              <button
                key={day.iso}
                type="button"
                className={[
                  "day-cell",
                  day.inCurrentMonth ? "" : "muted",
                  day.isSelected ? "selected" : "",
                  day.isToday ? "today" : "",
                  day.holiday ? "holiday" : "",
                  day.description?.content ? "has-note" : ""
                ].join(" ")}
                onClick={() => chooseDay(day)}
                aria-label={`${day.dayName}, ${day.iso}`}
              >
                <span>{day.day}</span>
              </button>
            ))}
          </div>
        </section>
      </section>

      <button
        className={`modal-backdrop ${detailOpen ? "open" : ""}`}
        type="button"
        onClick={() => setDetailOpen(false)}
        aria-label="Tutup detail hari"
      />

      <aside className={`glass-panel note-panel detail-sidebar ${detailOpen ? "open" : ""}`} aria-hidden={!detailOpen}>
        <header className="detail-header">
          <div>
            <p className="weekday">{selectedDay.dayName},</p>
            <p className="date-line">
              {selectedDay.day} {calendar.monthName} {selectedDay.year}
            </p>
          </div>
          <button type="button" onClick={() => setDetailOpen(false)} aria-label="Tutup detail hari">
            <X size={20} />
          </button>
        </header>

        <button className="add-button" type="button" onClick={() => setEditing(true)} aria-label="Tambah deskripsi">
          <Plus size={32} strokeWidth={3} />
        </button>
        {selectedDay.holiday ? (
          <div className="holiday-card">
            <span>{selectedDay.holiday.type}</span>
            <strong>{selectedDay.holiday.name}</strong>
          </div>
        ) : null}
        <p className="note-kicker">Tambah deskripsi</p>
        <p className="note-sub">untuk hari ini</p>

        <div className="description-box">
          <div className="description-title">
            <span>Deskripsi Hari</span>
            <CalendarDays size={26} />
          </div>
          {editing ? (
            <div className="editor">
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} autoFocus maxLength={500} />
              <div className="editor-actions">
                <button type="button" onClick={saveDescription} disabled={saving} aria-label="Simpan deskripsi">
                  <Save size={18} />
                </button>
                <button type="button" onClick={() => setEditing(false)} disabled={saving} aria-label="Batal">
                  <X size={18} />
                </button>
              </div>
              {saveError ? <p className="save-error">{saveError}</p> : null}
            </div>
          ) : (
            <p className={selectedDescription ? "description-text" : "description-empty"}>
              {selectedDescription || "Belum ada deskripsi untuk hari ini."}
            </p>
          )}
        </div>
      </aside>
    </main>
  );
}

function WeatherIcon({ type }) {
  return (
    <span className={`pixel-weather ${type}`} aria-hidden="true">
      <span />
    </span>
  );
}

function MoonIcon({ phase }) {
  return (
    <span className={`pixel-moon ${phase}`} aria-hidden="true">
      <span />
    </span>
  );
}

function toIso(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(date) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })
    .format(date)
    .replace(".", ":");
}

function updateCalendarDescription(calendar, date, description) {
  const withDescription = (day) => (day.iso === date ? { ...day, description } : day);

  return {
    ...calendar,
    selectedDay: withDescription(calendar.selectedDay),
    weeks: calendar.weeks.map((week) => week.map(withDescription))
  };
}

function selectCalendarDay(calendar, selectedDay) {
  return {
    ...calendar,
    selectedDay: { ...selectedDay, isSelected: true },
    weeks: calendar.weeks.map((week) =>
      week.map((day) => ({
        ...day,
        isSelected: day.iso === selectedDay.iso
      }))
    )
  };
}
