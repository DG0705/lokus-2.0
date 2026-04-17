import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, message = "OK", init?: ResponseInit) {
  return NextResponse.json({ success: true, message, data }, init);
}

export function apiError(message: string, status = 400, errorCode?: string) {
  return NextResponse.json({ success: false, message, errorCode }, { status });
}
