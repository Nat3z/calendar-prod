import axios from 'axios';
import ical from 'node-ical';
// @ts-ignore
import ics from 'ics';
import { buildSchedule, matchRegex, matchRegex_ExcludeColonTime_inverse, matchRegex_inverse, parseAllDates, sendErrorResponse } from '../../lib/schedule-helper';

function getNextDayOfTheWeek(dayName: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday", excludeToday = false, refDate = new Date()) {
  const dayOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
    .indexOf(dayName.slice(0, 3).toLowerCase());
  if (dayOfWeek < 0) return;
  // if (process.env.VERCEL_ENV === "production") {
  //   refDate = subtractHours(refDate, 2)
  // }

  refDate.setHours(0, 0, 0, 0);
  refDate.setDate(refDate.getDate() + +!!excludeToday +
    (dayOfWeek + 7 - refDate.getDay() - +!!excludeToday) % 7);
  return refDate;
}

function generateFallbacks() {
  const monday = getNextDayOfTheWeek("Monday", false)!
  const tuesday = getNextDayOfTheWeek("Tuesday", false)!
  const wednesday = getNextDayOfTheWeek("Wednesday", false)!
  const thursday = getNextDayOfTheWeek("Thursday", false)!
  const friday = getNextDayOfTheWeek("Friday", false)!

  const icsMonday = ics.createEvents([{
    start: [monday.getFullYear(), monday.getMonth() + 1, monday.getDate(), 6, 0],
    end: [monday.getFullYear(), monday.getMonth() + 1, monday.getDate(), 15, 0],
    title: "Monday Schedule",
    description: `1 Blk 8:30 - 9:50
    2 Blk 10:05 - 11:20
    L 11:20 - 12:00
    3 Blk 12:05 - 1:20
    4 Blk 1:30 - 2:45
    Tutoring 2:55-3:20`
  }, {
    start: [tuesday.getFullYear(), tuesday.getMonth() + 1, tuesday.getDate(), 6, 0],
    end: [tuesday.getFullYear(), tuesday.getMonth() + 1, tuesday.getDate(), 15, 0],
    title: "Tuesday Schedule",
    description: `5 Blk 8:30 - 9:50
    6 Blk 10:05 - 11:20
    L 11:20 - 12:00
    7 Blk 12:05 - 1:20
    1 Blk 1:30 - 2:25
    Flex 2:30 - 3:00`
  }, {
    start: [wednesday.getFullYear(), wednesday.getMonth() + 1, wednesday.getDate(), 6, 0],
    end: [wednesday.getFullYear(), wednesday.getMonth() + 1, wednesday.getDate(), 15, 0],
    title: "Wednesday Schedule",
    description: `2 Blk 8:30 - 9:30
    3 Blk 9:38 - 10:33
    4 Blk 10:41 - 11:36
    L 11:38 - 12:18
    Faith Families/Community Time 12:23-12:58
    5 Blk 1:02 - 1:57
    6 Blk 2:05 - 3:00`
  }, {
    start: [thursday.getFullYear(), thursday.getMonth() + 1, thursday.getDate(), 6, 0],
    end: [thursday.getFullYear(), thursday.getMonth() + 1, thursday.getDate(), 15, 0],
    title: "Thursday Schedule",
    description: `7 Blk 8:30 - 9:30
    1 Blk 9:45 - 11:00
    L 11:00 - 11:40
    2 Blk 11:45 - 1:00
    3 Blk 1:10 - 2:25
    Flex - 2:30 - 3:00`
  }, {
    start: [friday.getFullYear(), friday.getMonth() + 1, friday.getDate(), 6, 0],
    end: [friday.getFullYear(), friday.getMonth() + 1, friday.getDate(), 15, 0],
    title: "Friday Schedule",
    description: `4 Blk 8:30 - 9:50
    5 Blk 10:05 - 11:20
    L 11:20 - 12:00
    6 Blk 12:05 - 1:20
    7 Blk 1:30 - 2:45`
  }], (err: any, value: any) => {
    if (err) {
      console.error(err)
    }
    return value
  })
  return icsMonday!
}

declare global {
  interface Request {
    query: Record<string, string>
  }
}

export default async function handler(request: Request) {
  let res = new Response();
  let req = request;

  let { today, refDate } = parseAllDates(req);

  if (!today || !refDate) {
    return sendErrorResponse(res, "Invalid today/refDate timestamp", 400);
  }

  let ics = (await axios.get("https://www.salesian.com/data/calendar/icalcache/calendar_369.ics")).data
  // parse the ics file with node-ical
  let events = await ical.async.parseICS(ics)
  let vEvents = Object.values(events).filter(event => event.type == "VEVENT")

  // get the current date and find the event in the ics
  let schoolToBeClosed = false;
  let endOfSchool = false;
  let eventDescription = "";
  let title: string = "";
  /* @ts-ignore */
  let event: ical.VEvent | undefined = vEvents.find(event => {
    if (event.type !== "VEVENT") return false
    // development
    if (event.start.getDate() == today.getDate() && event.start.getMonth() == today.getMonth() && event.start.getFullYear() == today.getFullYear()) {
      if (!schoolToBeClosed)
        schoolToBeClosed = event.summary.includes("No School") || event.summary.includes("School Closed");
      if (event.summary.includes("Last Day of School") && !endOfSchool) {
        endOfSchool = true;
        eventDescription = `
        8:30 - 9:50 Blk 6 EOSA
        10:30 - 11:30 Senior Class Farewell
        `
        return true;
      }
      return (
        event.description.match(matchRegex) != null ||
        event.description.match(matchRegex_inverse) != null ||
        event.description.match(matchRegex_ExcludeColonTime_inverse) != null
      )
    }
  })

  // if the event is null in normal calendar, go to the fallback calendar
  let gotFromCache = false
  if (!event) {
    gotFromCache = true
    events = await ical.async.parseICS(generateFallbacks())
    vEvents = Object.values(events).filter(event => event.type == "VEVENT")

    /* @ts-ignore */
    event = vEvents.find(event => {
      if (event.type !== "VEVENT") return false
      console.log(event.start.getDate(), today.getDate())
      if (event.start.getDate() == today.getDate() && event.start.getMonth() == today.getMonth() && event.start.getFullYear() == today.getFullYear()) {
        return event.description.match(matchRegex) != null
      }
    })

    if (event) {
      title = event.summary
      eventDescription = event.description
    }
  }

  if (event && !gotFromCache) {
    if (!title)
      title = event.summary
    if (!eventDescription)
      eventDescription = event.description
  }

  return buildSchedule(req, res, {
    eventTitle: title,
    eventDescription,
    schoolClosed: schoolToBeClosed,
    gotFromCache
  });
}
