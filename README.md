# DynSchedule
The dynamic scheduling solution for Salesian College Preparatory (not affiliated).

Powered using Dynamic APIs, DynSchedule guarantees Salesian students a easy-to-use schedule system that is highly customizable and non-invasive.

## Features:
- Theme Editor
- Countdown Timer for each period

## Planned:
- nothing planned

# Installation/Setup
Pull the branch from Github and run
```bash
pnpm install
```
**on each folder (client + server)**

In the root directory, run this to start the server + the frontend.
```bash
pnpm run dev
```
# API Documentation
Requests can be made to the [https://api-schedule.nat3z.com/api/schedule](https://api-schedule.nat3z.com/api/schedule) to receive the latest schedule.
If you wish to live on the **bleeding edge**, you can use the [https://development-api-schedule.nat3z.com/api/schedule](https://development-api-schedule.nat3z.com/api/schedule) endpoint.

Here's an example request in JavaScript
```js
fetch("https://api-schedule.nat3z.com/api/schedule")
  .then(
    (res) => res.json()
      .then(response => console.log)
  )
```
| QueryParam    | Type           |
| ------------- | -------------- |
| refDate       | Unix timestamp |
| date          | Unix timestamp |

```typescript
interface Response {
  title: string,
  events: {
    name_of_event: {
      start: string,
      end: string
    }
    ...
  },
  possiblyClosed: boolean,
  code: number,
  message: string,
  endOfSchool: boolean
}
```
