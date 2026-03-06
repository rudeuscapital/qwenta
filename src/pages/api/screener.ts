import type { APIRoute } from "astro";
import { screenerHandler } from "./_handlers.js";
export const POST: APIRoute = screenerHandler;
