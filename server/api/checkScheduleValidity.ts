import { VercelRequest, VercelResponse } from "@vercel/node";
import ical from "node-ical";
import axios from "axios";

export default async (req: VercelRequest, res: VercelResponse) => {
  return res.send("ok")
  // let ics = (await axios.get("https://www.salesian.com/data/calendar/icalcache/calendar_369.ics")).data;
  // const plainTextRegex = /^[^-|:]+/gm;
  // let events = await ical.async.parseICS(ics)
  // let vEvents = Object.values(events).filter(event => event.type == "VEVENT")
  // let today = new Date()

  // const matchRegex = /(.*?) (\d{1,2}:\d{2}(?:(?:\s+)?-(?:\s)?)\d{1,2}:\d{2})(?:.*?)/gm;
  
  // /* @ts-ignore */
  // let event: ical.VEvent | undefined = vEvents.find(event => {
  //   if (event.type !== "VEVENT") return false
  //   // development
  //   if (event.start.getDate() == today.getDate() && event.start.getMonth() == today.getMonth() && event.start.getFullYear() == today.getFullYear()) {
  //     return event.description.match(matchRegex) != null
  //   }
  // })
  // if (!event) return res.send("No custom schedule found for today.")
  // function sendErrorAPI(events: string[] = []) {
  //   // send an embed to the error channel through discord using the webhook and also @everyone
  //   var options = {
  //     method: 'POST',
  //     url: 'https://maker.ifttt.com/trigger/mangadex_update/with/key/' + process.env.ifttt,
  //     headers: {
  //       Accept: '*/*',
  //       'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
  //       'Content-Type': 'application/json'
  //     },
  //     data: {
  //       value1: '‼️ Schedule Issue Detected.',
  //       value2: 'plz go fix ty',
  //       value3: 'https://schedule.nat3z.com/'
  //     }
  //   };

  //   axios.request(options).then(function (response) {
  //     console.log(response.data);
  //   }).catch(function (error) {
  //     console.error(error);
  //   });
  // }
  // let title = event.summary
  // let eventsToCheck: string[] = []
  // let matchedTime: RegExpExecArray | null
  // event.description = event.description.replace("8:20am - Welcome Bell", "")
  // // get the current url of this api
  // let fromAPI = await axios.get(process.env.VERCEL_URL!.startsWith("localhost") ? `http://${process.env.VERCEL_URL}/api/schedule` : `https://${process.env.VERCEL_URL}/api/schedule`)
  // let fromAPIEvents = fromAPI.data.events
  // let fromAPIEventNames = Object.keys(fromAPIEvents)
  // let eventsErrored: string[] = []
  // for (const event of fromAPIEventNames) {
  //   const schedule = fromAPIEvents[event]
  //   if (!schedule.start || !schedule.end) {
  //     eventsErrored.push(event)
  //     continue
  //   }
  //   else if (schedule.start === schedule.end) {
  //     eventsErrored.push(event)
  //     continue
  //   }
  // }
  // if (eventsErrored.length > 0) {
  //   sendErrorAPI(eventsErrored)
  //   return res.send("Schedule is invalid.")
  // }
  // return res.send("Schedule is valid.")
}