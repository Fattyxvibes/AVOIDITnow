import type { CookieOptions, Request } from "express";
import { ENV } from "./env";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  // Production runs behind the single explicitly trusted edge proxy configured
  // in server bootstrap. Development does not trust forwarded request headers.
  if (ENV.isProduction) {
    const forwardedProto = req.headers["x-forwarded-proto"];
    const protoList = Array.isArray(forwardedProto) ? forwardedProto : typeof forwardedProto === "string" ? forwardedProto.split(",") : [];
    return protoList.some(proto => proto.trim().toLowerCase() === "https");
  }

  return false;
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // const hostname = req.hostname;
  // const shouldSetDomain =
  //   hostname &&
  //   !LOCAL_HOSTS.has(hostname) &&
  //   !isIpAddress(hostname) &&
  //   hostname !== "127.0.0.1" &&
  //   hostname !== "::1";

  // const domain =
  //   shouldSetDomain && !hostname.startsWith(".")
  //     ? `.${hostname}`
  //     : shouldSetDomain
  //       ? hostname
  //       : undefined;

  return {
    httpOnly: true,
    path: "/",
    sameSite: ENV.isProduction ? "lax" : "none",
    secure: isSecureRequest(req),
  };
}

export function getOAuthStateCookieOptions(req: Request): Pick<CookieOptions, "path" | "sameSite" | "secure"> {
  return {
    path: "/",
    sameSite: ENV.isProduction ? "lax" : "none",
    secure: isSecureRequest(req),
  };
}
