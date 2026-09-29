"use client";

import { useEffect, useState } from "react";
import { EVENTS_INFO } from "@/lib/content";
import { eventBookingUrl, formatEventDate, listUpcomingEvents, type PublicEvent } from "@/lib/events";

export function EventsSection() {
  const [events, setEvents] = useState<PublicEvent[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    listUpcomingEvents()
      .then(setEvents)
      .catch(() => setError(true));
  }, []);

  return (
    <section id="events" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-black text-primary sm:text-3xl">{EVENTS_INFO.title}</h2>
      <p className="mt-2 max-w-2xl text-ink-soft">{EVENTS_INFO.description}</p>

      {error && (
        <p className="mt-6 rounded-2xl border border-border bg-white p-5 text-sm text-muted elev-1">
          فهرست رویدادها موقتاً در دسترس نیست — به‌زودی از همین‌جا اطلاع‌رسانی می‌شود.
        </p>
      )}

      {!error && events?.length === 0 && (
        <p className="mt-6 rounded-2xl border border-border bg-white p-5 text-sm text-muted elev-1">
          در حال حاضر رویداد فعالی ثبت نشده — رویدادهای بعدی همین‌جا اعلام می‌شوند.
        </p>
      )}

      {events && events.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <div key={ev.id} className="card-lift flex flex-col rounded-2xl border border-border bg-white p-5 elev-1">
              <div className="text-xs font-bold text-gold-dark">{formatEventDate(ev.startAt)}</div>
              <div className="mt-1 font-bold text-primary">{ev.title}</div>
              {ev.venue && <div className="mt-1 text-xs text-muted">{ev.venue}</div>}
              {ev.isOnline && <div className="mt-1 text-xs text-muted">برگزاری آنلاین</div>}
              <a
                href={eventBookingUrl(ev.slug)}
                className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-center text-xs font-bold text-white transition hover:bg-primary-dark"
              >
                رزرو رویداد
              </a>
            </div>
          ))}
        </div>
      )}

      {!events && !error && <p className="mt-6 text-sm text-muted">در حال بارگذاری رویدادها…</p>}
    </section>
  );
}
