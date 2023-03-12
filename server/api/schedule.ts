import { VercelRequest, VercelResponse } from '@vercel/node';
import moment from 'moment';
const matchRegex_inverse = /(\d{1,2}:\d{2}(?:.*?)(?: - |-|- )\d{1,2}:\d{2})(?:.*?) (.*)/gm;

const matchRegex = /(.*?) (\d{1,2}:\d{2}(?: - |-|- )\d{1,2}:\d{2})(?:.*?)/gm;
import axios from 'axios';
import * as ical from 'node-ical';
import * as ics from 'ics';

function subtractHours(date: Date, hours: number) {
  const newDate = new Date(date);
  const currentHours = newDate.getDate();
  let newHours = currentHours - hours;
  if (newHours >= 0) {
      newDate.setDate(newHours);
  } else {
      const daysToSubtract = Math.ceil(Math.abs(newHours) / 24);
      newDate.setDate(newDate.getDate() - daysToSubtract);
      newHours = 24*daysToSubtract + newHours;
      newDate.setDate(newHours);
  }
  return newDate;
}

function addHours(date: Date, hours: number) {
  const newDate = new Date(date);
  const currentHours = newDate.getHours();
  const newHours = currentHours + hours;
  if (newHours < 24) {
      newDate.setHours(newHours);
  } else {
      const daysToAdd = Math.floor(newHours / 24);
      newDate.setDate(newDate.getDate() + daysToAdd);
      newDate.setHours(newHours % 24);
  }
  return newDate;
}


function getNextDayOfTheWeek(dayName: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday", excludeToday = false, refDate = new Date()) {
  const dayOfWeek = ["sun","mon","tue","wed","thu","fri","sat"]
    .indexOf(dayName.slice(0,3).toLowerCase());
  if (dayOfWeek < 0) return;
  if (process.env.VERCEL_ENV === "production") {
    refDate = subtractHours(refDate, 2)
  }

  refDate.setHours(0,0,0,0);
  refDate.setDate(refDate.getDate() + +!!excludeToday + 
    (dayOfWeek + 7 - refDate.getDay() - +!!excludeToday) % 7);
  return refDate;
}

function generateFallbacks() {
  const monday = getNextDayOfTheWeek("Monday")!
  const tuesday = getNextDayOfTheWeek("Tuesday")!
  const wednesday = getNextDayOfTheWeek("Wednesday")!
  const thursday = getNextDayOfTheWeek("Thursday")!
  const friday = getNextDayOfTheWeek("Friday")!

  const icsMonday = ics.createEvents([{
    start: [ monday.getFullYear(), monday.getMonth() + 1, monday.getDate(), 6, 0 ],
    end: [ monday.getFullYear(), monday.getMonth() + 1, monday.getDate(), 15, 0 ],
    title: "Monday Schedule",
    description: `1 Blk 8:30 - 9:50
    2 Blk 10:05 - 11:20
    L 11:20 - 12:00
    3 Blk 12:05 - 1:20
    4 Blk 1:30 - 2:45
    Tutoring 2:55-3:20`
  }, {
    start: [ tuesday.getFullYear(), tuesday.getMonth() + 1, tuesday.getDate(), 6, 0 ],
    end: [ tuesday.getFullYear(), tuesday.getMonth() + 1, tuesday.getDate(), 15, 0 ],
    title: "Tuesday Schedule",
    description: `5 Blk 8:30 - 9:50
    6 Blk 10:05 - 11:20
    L 11:20 - 12:00
    7 Blk 12:05 - 1:20
    1 Blk 1:30 - 2:25
    Flex 2:30 - 3:00`
  }, {
    start: [ wednesday.getFullYear(), wednesday.getMonth() + 1, wednesday.getDate(), 6, 0 ],
    end: [ wednesday.getFullYear(), wednesday.getMonth() + 1, wednesday.getDate(), 15, 0 ],
    title: "Wednesday Schedule",
    description: `2 Blk 8:30 - 9:30
    3 Blk 9:38 - 10:33
    4 Blk 10:41 - 11:36
    L 11:38 - 12:18
    Faith Families/Community Time 12:23-12:58
    5 Blk 1:02 - 1:57
    6 Blk 2:05 - 3:00`
  }, {
    start: [ thursday.getFullYear(), thursday.getMonth() + 1, thursday.getDate(), 6, 0 ],
    end: [ thursday.getFullYear(), thursday.getMonth() + 1, thursday.getDate(), 15, 0 ],
    title: "Thursday Schedule",
    description: `7 Blk 8:30 - 9:30
    1 Blk 9:45 - 11:00
    L 11:00 - 11:40
    2 Blk 11:45 - 1:00
    3 Blk 1:10 - 2:25
    Flex - 2:30 - 3:00`
  }, {
    start: [ friday.getFullYear(), friday.getMonth() + 1, friday.getDate(), 6, 0 ],
    end: [ friday.getFullYear(), friday.getMonth() + 1, friday.getDate(), 15, 0 ],
    title: "Friday Schedule",
    description: `4 Blk 8:30 - 9:50
    5 Blk 10:05 - 11:20
    L 11:20 - 12:00
    6 Blk 12:05 - 1:20
    7 Blk 1:30 - 2:45`
  }], (err, value) => {
    if (err) {
      console.error(err)
    }
    return value
  })
  return icsMonday!
}

export default async (req: VercelRequest, res: VercelResponse) => {
  // enable cors
  res.setHeader('Access-Control-Allow-Credentials', "true")
  res.setHeader('Access-Control-Allow-Origin', '*')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  let ics = (await axios.get("https://www.salesian.com/data/calendar/icalcache/calendar_369.ics")).data
  // parse the ics file with node-ical
  let events = await ical.async.parseICS(ics)
  let vEvents = Object.values(events).filter(event => event.type == "VEVENT")
  // get the current date and find the event in the ics
  let today = new Date()
  
  /* @ts-ignore */
  let event: ical.VEvent | undefined = vEvents.find(event => {
    if (event.type !== "VEVENT") return false
    // development
    // return event.summary === "Schedule Change: Early 2:20pm Dismissal; PD for Faculty";
    if (event.start.getDate() == today.getDate() && event.start.getMonth() == today.getMonth() && event.start.getFullYear() == today.getFullYear()) {
      return event.description.match(matchRegex) != null
    }
  })

  // if the event is null in normal calendar, go to the fallback calendar
  if (!event) {
    events = await ical.async.parseICS(generateFallbacks())
    vEvents = Object.values(events).filter(event => event.type == "VEVENT")

    /* @ts-ignore */
    event = vEvents.find(event => {
      if (event.type !== "VEVENT") return false
      if (event.start.getDate() == today.getDate() && event.start.getMonth() == today.getMonth() && event.start.getFullYear() == today.getFullYear()) {
        return event.description.match(matchRegex) != null
      }
    })
  }

  if (!event) return res.json({ title: null, events: null, code: 500, message: "Did not find VEevent for today." })
  let title = event.summary
  let times = new Map<string, { start: string, end: string }>()

  let matchedTime: RegExpExecArray | null
  while ((matchedTime = matchRegex.exec(event.description)) !== null || (matchedTime = matchRegex_inverse.exec(event.description)) !== null) {
    let time = matchedTime[2].replaceAll(" ", "").trim()
    let period = matchedTime[1].replace("-", "").replace(":", "").trim()

    if (time.match(/^[a-zA-Z]/)) {
      // if this is the case, then just inverse the props
      time = matchedTime[1].replaceAll(" ", "").trim()
      period = matchedTime[2].replace("-", "").replace(":", "").trim()
    }

    if (!time || !period || !time.match(/[0-9]:[0-9]/)) continue;
    // if the time is below 8am, add 12 hours to it
    time = time.split("-").map(time => {
      let [hour, minute] = time.split(":").map(Number)
      if (hour < 8 || hour === 12) {
        return `${hour}:${minute < 10 ? "0" + minute : minute} PM`
      }
      return `${hour}:${minute < 10 ? "0" + minute : minute} AM`
    }).join("-")
    times.set(period, { start: time.split("-")[0], end: time.split("-")[1] })
  }

  let sortedTimes = new Map([...times.entries()].sort((a, b) => {
    let [aStart, bStart] = [a[1].start, b[1].start].map(time => {
      // regex to match time, "8:30 PM" or "12:05 PM" ignore the time delta
      let [, hour, minute] = (/([0-9]+):([0-9]+)/).exec(time)!
      if (!hour || !minute) return 0
      let hour_num = Number(hour)
      if (hour_num < 8) hour_num += 12
      let minute_num = Number(minute)
      return hour_num * 60 + minute_num
    })
    return aStart - bStart
  }))
  res = res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
  return res.json({ title, events: Object.fromEntries(sortedTimes), code: 200 })
}