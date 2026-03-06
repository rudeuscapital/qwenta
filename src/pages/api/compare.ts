import type { APIRoute } from "astro";
import { compareHandler } from "./_handlers.js";
export const GET: APIRoute = compareHandler;
