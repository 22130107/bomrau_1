import { NextRequest, NextResponse } from "next/server";

function getOrigin(request: NextRequest): string {
  // 1. Thử lấy từ header Referer (do trình duyệt gửi lên, không bị ảnh hưởng bởi lỗi proxy Nginx)
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const host = refererUrl.host;
      if (host && (host.includes(".") || host.includes("localhost") || host.includes("127.0.0.1"))) {
        const proto = refererUrl.protocol.replace(":", "");
        return `${proto}://${host}`;
      }
    } catch (e) {
      // Bỏ qua
    }
  }

  // 2. Dự phòng: Lấy từ headers thông thường
  let forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost === "http" || forwardedHost === "https") {
    forwardedHost = null;
  }
  let host = forwardedHost || request.headers.get("host") || request.nextUrl.host;
  
  // Kiểm tra xem host có hợp lệ không
  const isValidHost = host && (host.includes(".") || host.includes("localhost") || host.includes("127.0.0.1"));
  
  if (!isValidHost) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "/";
    return baseUrl.replace(/\/$/, "");
  }
  
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
  const proto = isLocalhost ? "http" : "https";
  return `${proto}://${host}`;
}

export async function POST(request: NextRequest) {
  const origin = getOrigin(request);
  const response = NextResponse.redirect(new URL("/login", origin));
  response.cookies.delete("session");
  return response;
}

export async function GET(request: NextRequest) {
  const origin = getOrigin(request);
  const response = NextResponse.redirect(new URL("/login", origin));
  response.cookies.delete("session");
  return response;
}
