async function fetchCalendars() {
  const token = getToken();
  const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: { Authorization: 'Bearer ' + token }
  });

  if (!res.ok) throw new Error('Could not load your calendars.');

  const data = await res.json();
  return data.items.filter(c => c.accessRole === 'owner' || c.accessRole === 'writer');
}

// Figures out the actual date for the next occurrence of a given weekday
// e.g. if today is Wednesday and the event is on "Monday", we go to next Monday
function nextDateForDay(dayName) {
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const target = days.indexOf(dayName.toLowerCase());
  if (target === -1) return null;

  const today = new Date();
  const current = today.getDay();
  let diff = target - current;
  if (diff <= 0) diff += 7;

  const date = new Date(today);
  date.setDate(today.getDate() + diff);
  return date;
}

function buildEventDateTime(day, timeStr) {
  const date = nextDateForDay(day);
  if (!date) return null;

  const [hours, minutes] = timeStr.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);

  // Google Calendar wants ISO 8601 with timezone offset
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const pad = n => String(Math.floor(Math.abs(n))).padStart(2, '0');
  const tzOffset = sign + pad(offset / 60) + ':' + pad(offset % 60);

  const iso = date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0') + 'T' +
    String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':00' + tzOffset;

  return iso;
}

async function pushEventsToCalendar(calendarId, events) {
  const token = getToken();
  const results = { success: 0, failed: [] };

  for (const ev of events) {
    const startIso = buildEventDateTime(ev.day, ev.start_time);
    const endIso = buildEventDateTime(ev.day, ev.end_time);

    if (!startIso || !endIso) {
      results.failed.push(ev.title + ' (bad date/time)');
      continue;
    }

    const body = {
      summary: ev.title,
      location: ev.location || '',
      description: ev.notes || '',
      start: { dateTime: startIso },
      end: { dateTime: endIso },
      recurrence: ['RRULE:FREQ=WEEKLY']
    };

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (res.ok) {
      results.success++;
    } else {
      const err = await res.json().catch(() => ({}));
      results.failed.push(ev.title + ' — ' + (err.error?.message || 'unknown error'));
    }
  }

  return results;
}
