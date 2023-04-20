import { VercelRequest, VercelResponse } from "@vercel/node";
import ical from "node-ical";
import axios from "axios";

export default async (req: VercelRequest, res: VercelResponse) => {
  let ics = (await axios.get("https://www.salesian.com/data/calendar/icalcache/calendar_369.ics")).data;
  const plainTextRegex = /^[^-|:]+/gm;
  let events = await ical.async.parseICS(ics)
  let vEvents = Object.values(events).filter(event => event.type == "VEVENT")
  let today = new Date()
  const matchRegex = /(.*?) (\d{1,2}:\d{2}(?: - |-|- )\d{1,2}:\d{2})(?:.*?)/gm;
  /* @ts-ignore */
  let event: ical.VEvent | undefined = vEvents.find(event => {
    if (event.type !== "VEVENT") return false
    // development
    if (event.start.getDate() == today.getDate() && event.start.getMonth() == today.getMonth() && event.start.getFullYear() == today.getFullYear()) {
      return event.description.match(matchRegex) != null
    }
  })
  if (!event) return res.send("No custom schedule found for today.")
  function sendErrorAPI(events: string[] = []) {
    // send an embed to the error channel through discord using the webhook and also @everyone
    axios.post(process.env.DISCORD_WEBHOOK!, {
      embeds: [
        {
          title: "Schedule Error",
          description: `The schedule for ${today.toLocaleDateString()} is invalid. Please check the schedule and fix it.\n**Missing Events:** \n- ${events.join("\n- ")}`,
          color: 0xff0000,
          timestamp: new Date().toISOString(),
          footer: {
            text: "DynSchedule Alert"
          },
        }
      ],
      content: ""
    });
  }
  let title = event.summary
  let eventsToCheck: string[] = []
  let matchedTime: RegExpExecArray | null
  event.description = event.description.replace("8:20am - Welcome Bell", "")
  while ((matchedTime = plainTextRegex.exec(event.description)) !== null) {
    eventsToCheck.push(matchedTime[0].replace(/ \d+$/g, "").trim())
  }
  // get the current url of this api
  let fromAPI = await axios.get(process.env.VERCEL_URL!.startsWith("localhost") ? `http://${process.env.VERCEL_URL}/api/schedule` : `https://${process.env.VERCEL_URL}/api/schedule`)
  let fromAPIEvents = fromAPI.data.events
  let fromAPIEventNames = Object.keys(fromAPIEvents)
  let eventsNotFound: string[] = []
  for (const event of eventsToCheck) {
    if (!fromAPIEventNames.includes(event)) {
      eventsNotFound.push(event)
    }
  }
  if (eventsNotFound.length > 0) {
    sendErrorAPI(eventsNotFound)
    return res.send("Schedule is invalid.")
  }
  return res.send("Schedule is valid.")
}