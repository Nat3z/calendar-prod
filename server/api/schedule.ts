import { VercelRequest, VercelResponse } from '@vercel/node';
const matchRegex = /(.*?) (\d{1,2}:\d{2}(?: - |-|- )\d{1,2}:\d{2})(?:.*?)/gm;
import axios from 'axios';
import * as ical from 'node-ical';

export default async (req: VercelRequest, res: VercelResponse) => {
  let ics = (await axios.get("https://www.salesian.com/data/calendar/icalcache/calendar_369.ics")).data
  // parse the ics file with node-ical
  let events = await ical.async.parseICS(ics)
  const vEvents = Object.values(events).filter(event => event.type == "VEVENT")
  // get the current date and find the event in the ics
  let today = new Date()
  /* @ts-ignore */
  let event: ical.VEvent | undefined = vEvents.find(event => {
    if (event.type !== "VEVENT") return false
    // development
    // return event.summary === "Schedule Change: Early 2:20pm Dismissal; PD for Faculty";
    if (event.start.getDate() == today.getDate() && event.start.getMonth() == today.getMonth() && event.start.getFullYear() == today.getFullYear()) {
      return event.summary.match(matchRegex) != null
    }
  })  
  if (!event) return res.json({ title: null, events: null, code: 500, message: "Did not find VEevent for today." })
  let title = event.summary
  let times = new Map<string, { start: number, end: number }>()

  let matchedTime: RegExpExecArray | null
  while ((matchedTime = matchRegex.exec(event.description)) !== null) {
    let time = matchedTime[2].replace(" - ", "-").replace(" ", "-").replace("- ", "-")
    let period = matchedTime[1].replace("-", "").replace(":", "").trim()
    
    if (!time || !period) return res.json({ title: null, events: null, code: 500, message: "Did not find event time period in event description." })

    let [start, end] = time.split("-").map(time => new Date(today.getFullYear(), today.getMonth(), today.getDate(), ...time.split(":").map(Number)))
    // get the period of the event
    if (!start || !end) return res.json({ title: null, events: null, code: 500, message: "Did not find start and end times." })
    
    // if the time is before 8am, add 12 hours to it
    if (start.getHours() < 8) start.setHours(start.getHours() + 12)
    if (end.getHours() < 8) end.setHours(end.getHours() + 12)

    times.set(period, { start: start.getTime() / 1000, end: end.getTime() / 1000 })
  }

  return res.json({ title, events: Object.fromEntries(times), code: 200 })
}