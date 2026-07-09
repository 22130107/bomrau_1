import "server-only";

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

// In-memory store — reset khi server restart.
// Với production multi-instance dùng Redis thay thế.
const store = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;             // Số lần tối đa
const WINDOW_MS = 15 * 60 * 1000;  // Cửa sổ theo dõi: 15 phút
const BLOCK_MS = 15 * 60 * 1000;   // Thời gian bị chặn: 15 phút

// Dọn dẹp entry cũ mỗi 5 phút để tránh memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    const isBlockExpired = entry.blockedUntil && entry.blockedUntil < now;
    const isWindowExpired = !entry.blockedUntil && now - entry.firstAttempt > WINDOW_MS;
    if (isBlockExpired || isWindowExpired) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMinutes?: number;
}

/**
 * Kiểm tra và ghi nhận 1 lần thử cho key (thường là IP hoặc IP+username).
 * Trả về { allowed: false } nếu vượt quá giới hạn.
 */
export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // Đang bị chặn?
  if (entry?.blockedUntil) {
    if (now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMinutes: Math.ceil((entry.blockedUntil - now) / 60_000),
      };
    }
    // Hết thời gian chặn → xóa và bắt đầu lại
    store.delete(key);
  }

  // Cửa sổ cũ đã hết hạn → tạo cửa sổ mới
  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    store.set(key, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  const newCount = entry.count + 1;

  // Vượt quá giới hạn → chặn
  if (newCount > MAX_ATTEMPTS) {
    store.set(key, { ...entry, count: newCount, blockedUntil: now + BLOCK_MS });
    return {
      allowed: false,
      remaining: 0,
      retryAfterMinutes: Math.ceil(BLOCK_MS / 60_000),
    };
  }

  store.set(key, { ...entry, count: newCount });
  return { allowed: true, remaining: MAX_ATTEMPTS - newCount };
}

/**
 * Reset rate limit cho key (gọi sau khi đăng nhập thành công).
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}
