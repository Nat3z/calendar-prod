import type { APIRoute } from 'astro';
import { sendErrorResponse } from '../../lib/schedule-helper';
import SalesianHandler from '../../lib/schedules/salesian';

declare global {
  interface Request {
    query: Record<string, string>
  }
}

export const GET: APIRoute = async ({ request }) => {
  let res = new Response();
  let req = request;

  const SCHOOL_ASSIGNMENT = import.meta.env.SCHOOL_ASSIGNMENT;
  if (!SCHOOL_ASSIGNMENT || typeof SCHOOL_ASSIGNMENT !== "string") {
    return sendErrorResponse(res, "Server did not provide a valid SCHOOL_ASSIGNMENT", 500);
  }

  switch (SCHOOL_ASSIGNMENT) {
    case "salesian":
      return await SalesianHandler(req);
    default:
      return sendErrorResponse(res, "Server did not provided a real school.", 500);
  }


}
