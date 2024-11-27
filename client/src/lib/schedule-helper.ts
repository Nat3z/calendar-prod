import moment from "moment";

export const matchRegex_inverse = /(\d{1,2}:\d{2}(?:(?:\s+)?-(?:\s)?)\d{1,2}:\d{2})(?:.*?) (.*)/gm;
export const matchRegex_ExcludeColonTime = /(.*?) (\d{1,2}(?:(?:\s+)?-(?:\s)?)\d{1,2}:\d{2})(?:.*?)/gm;
export const matchRegex_ExcludeColonTime_inverse = /(\d{1,2}(?:(?:\s+)?-(?:\s)?)\d{1,2}:\d{2})(?:.*?) (.*)/gm;
export const matchRegex_ExcludeColonTimeBOTH = /(\d{1,2}(?:(?:\s+)?-(?:\s)?)\d{1,2})(?:.*?) (.*)/gm;
export const matchRegex_ExcludeColonTimeBOTH_inverse = /(\d{1,2}(?:(?:\s+)?-(?:\s)?)\d{1,2})(?:.*?) (.*)/gm;
export const matchRegex = /(.*?)(?:\s+)?(\d{1,2}:\d{2}(?:(?:\s+)?-(?:\s)?)\d{1,2}:\d{2})(?:.*?)/gm;

declare global {
  interface Request {
    query: Record<string, string>
  }
}
type event_configuration = {
  eventTitle: string
  eventDescription: string
  schoolClosed: boolean
  gotFromCache: boolean
}

export function parseAllDates(req: Request): { refDate: Date | undefined, today: Date | undefined } {
  let refDate = new Date();
  let today = new Date();
  req.query = Object.fromEntries(new URL(req.url).searchParams.entries())
  if (!req.query) return { refDate, today };

  if (req.query.date && typeof req.query.date === "string") {
    if (!/\d/.test(req.query.date)) {
      return { refDate: undefined, today: undefined };
    }
    // parse unix timestamp with moment
    today = moment.unix(parseInt(req.query.date)).toDate()
  }
  if (req.query.refDate && typeof req.query.refDate === "string") {
    if (!/\d/.test(req.query.refDate)) {
      return { refDate: undefined, today: undefined };
    }
    // parse unix timestamp with moment
    refDate = moment.unix(parseInt(req.query.refDate)).toDate()
  }
  return { refDate, today };
}

function pre(res: Response) {
  // enable cors
  res.headers.set('Access-Control-Allow-Credentials', "true")
  res.headers.set('Access-Control-Allow-Origin', '*')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  res.headers.set('Content-Type', 'application/json')
  res.headers.set('I-Am-A-Teapot', 'No')
  res.headers.set('Cache-Control', 's-maxage=1, stale-while-revalidate')

  return res;
}

export function buildSchedule(req: Request, res: Response, configuration: event_configuration) {
  let { eventTitle, eventDescription, schoolClosed, gotFromCache } = configuration;
  res = pre(res);

  req.query = Object.fromEntries(new URL(req.url).searchParams.entries())
  if (!eventDescription || !eventTitle) return new Response(JSON.stringify({ title: null, events: null, code: 500, message: "Event not found." }), res)
  let times = new Map<string, { start: string, end: string }>()
  let matchedTime: RegExpExecArray | null


  while ((matchedTime = matchRegex.exec(eventDescription)) !== null || (matchedTime = matchRegex_inverse.exec(eventDescription)) !== null || (matchedTime = matchRegex_ExcludeColonTime.exec(eventDescription)) !== null || (matchedTime = matchRegex_ExcludeColonTime_inverse.exec(eventDescription)) !== null || (matchedTime = matchRegex_ExcludeColonTimeBOTH_inverse.exec(eventDescription)) !== null || (matchedTime = matchRegex_ExcludeColonTimeBOTH.exec(eventDescription)) !== null) {
    let time = matchedTime[2].replaceAll(" ", "").trim()
    let period = matchedTime[1].replace("-", "").replace(":", "").trim()

    if (time.match(/^[a-zA-Z]/gm) || time.startsWith("-")) {
      // if this is the case, then just inverse the props
      time = matchedTime[1].replaceAll(" ", "").trim()
      period = matchedTime[2].replace("-", "").replace(":", "").trim()
    }


    if (!time || !period || !time.match(/[0-9]:[0-9]/)) continue;
    // if the time is below 8am, add 12 hours to it
    time = time.split("-").map(time => {
      if (time.match(/^[0-9]/)) time = time + ":00"

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
  return new Response(JSON.stringify({ title: eventTitle, events: Object.fromEntries(sortedTimes), possiblyClosed: schoolClosed, code: 200, message: gotFromCache ? "This event was received from the local cache." : "This event was received dynamically.", endOfSchool: false }), res)
}

export function sendErrorResponse(res: Response, message: string, code: number) {
  res = pre(res);
  return new Response(JSON.stringify({
    title: undefined,
    events: undefined,
    possiblyClosed: false,
    code,
    message,
    endOfSchool: false
  }), res);
}
