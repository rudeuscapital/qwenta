import type { APIRoute } from "astro";
import { exportHandler } from "./_handlers.js";
export const GET: APIRoute = exportHandler;
