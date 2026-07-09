"use client";

import { useState, useEffect, useActionState } from "react";
import { loginAction, registerAction, AuthState } from "@/app/actions/auth";

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);

  const [loginState, loginFormAction, loginPending] = useActionState<AuthState, FormData>(
    loginAction,
    null
  );
  const [registerState, registerFormAction, registerPending] = useActionState<AuthState, FormData>(
    registerAction,
    null
  );

  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isWebView, setIsWebView] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showWebViewModal, setShowWebViewModal] = useState(false);

  const error = googleError || (isLogin ? loginState?.error : registerState?.error);
  const isPending = isLogin ? loginPending : registerPending;

  // Phát hiện in-app browser (WebView) ngay khi mount
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    if (/FBAN|FBAV|FBBV|FBDV|FBMD|FBPN|FBLC|FBOP/i.test(ua) ||
        /Zalo|zalo/i.test(ua) ||
        /Instagram/i.test(ua) ||
        /Line\//i.test(ua) ||
        /; wv\)/i.test(ua)) {
      setIsWebView(true);
      return;
    }
  }, []);

  // Login/Register thành công → redirect ở client (cookie đã lưu xong)
  useEffect(() => {
    if (loginState?.success) {
      window.location.href = loginState.role === "admin" ? "/admin" : "/";
    } else if (registerState?.success) {
      window.location.href = "/";
    }
  }, [loginState, registerState]);

  // Xử lý error từ OAuth callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");
    if (oauthError) {
      const errorMessages: Record<string, string> = {
        google_denied: "Bạn đã từ chối đăng nhập Google.",
        missing_params: "Thiếu thông tin từ Google. Vui lòng thử lại.",
        invalid_state: "Phiên đăng nhập không hợp lệ. Vui lòng thử lại.",
        token_exchange: "Xác thực Google thất bại. Vui lòng thử lại.",
        user_info: "Không lấy được thông tin tài khoản Google.",
        server_config: "Lỗi cấu hình server. Liên hệ admin.",
        server_error: "Lỗi server. Vui lòng thử lại sau.",
      };
      setGoogleError(errorMessages[oauthError] || "Đăng nhập Google thất bại.");
      // Xóa error param khỏi URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  function handleGoogleLogin() {
    if (isWebView) {
      if (isIOS) {
        setShowWebViewModal(true);
      } else {
        // Android WebView: auto-open Chrome
        window.location.href = `intent://${window.location.host}/login#Intent;scheme=https;package=com.android.chrome;end`;
      }
      return;
    }
    // Redirect tới OAuth flow — hoạt động trên mọi trình duyệt/iOS
    window.location.href = "/api/auth/google/redirect";
  }

  return (
    <div className="w-full max-w-[420px] animate-fade-in-up">
      <div className="bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(251,191,36,0.15)]">
        {/* Tabs */}
        <div className="flex mb-6 border-b border-[rgb(253,230,138)]">
          <button
            id="tab-login"
            onClick={() => setIsLogin(true)}
            className={`flex-1 pb-3 text-[16px] md:text-[18px] font-bold transition-colors ${
              isLogin
                ? "text-[rgb(251,191,36)] border-b-2 border-[rgb(251,191,36)]"
                : "text-[rgba(238,238,238,0.5)] hover:text-[rgba(238,238,238,0.8)]"
            }`}
          >
            Đăng Nhập
          </button>
          <button
            id="tab-register"
            onClick={() => setIsLogin(false)}
            className={`flex-1 pb-3 text-[16px] md:text-[18px] font-bold transition-colors ${
              !isLogin
                ? "text-[rgb(251,191,36)] border-b-2 border-[rgb(251,191,36)]"
                : "text-[rgba(238,238,238,0.5)] hover:text-[rgba(238,238,238,0.8)]"
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-[rgba(220,38,38,0.15)] border border-[rgb(220,38,38)] rounded-lg flex items-center gap-2 animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[rgb(220,38,38)] shrink-0">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <p className="text-[rgb(220,38,38)] text-[13px]">{error}</p>
          </div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <form action={loginFormAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="login-username" className="text-[14px] text-[rgba(238,238,238,0.7)]">
                Tên đăng nhập
              </label>
              <input
                id="login-username"
                type="text"
                name="username"
                required
                placeholder="Nhập tên đăng nhập"
                className="w-full px-4 py-3 bg-[rgb(31,41,55)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] md:text-[16px] outline-none focus:border-[rgb(251,191,36)] transition-colors placeholder:text-[rgba(238,238,238,0.3)]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="login-password" className="text-[14px] text-[rgba(238,238,238,0.7)]">
                Mật khẩu
              </label>
              <input
                id="login-password"
                type="password"
                name="password"
                required
                placeholder="Nhập mật khẩu"
                className="w-full px-4 py-3 bg-[rgb(31,41,55)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] md:text-[16px] outline-none focus:border-[rgb(251,191,36)] transition-colors placeholder:text-[rgba(238,238,238,0.3)]"
              />
            </div>
            <button
              id="btn-login"
              type="submit"
              disabled={isPending}
              className="w-full py-3 mt-2 bg-[rgb(202,138,4)] hover:bg-[rgb(251,191,36)] disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold text-[16px] md:text-[18px] rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng Nhập"
              )}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form action={registerFormAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="reg-username" className="text-[14px] text-[rgba(238,238,238,0.7)]">
                Tên đăng nhập <span className="text-[rgb(220,38,38)]">*</span>
              </label>
              <input
                id="reg-username"
                type="text"
                name="username"
                required
                placeholder="Tối thiểu 3 ký tự, chỉ chữ/số/_"
                className="w-full px-4 py-3 bg-[rgb(31,41,55)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] md:text-[16px] outline-none focus:border-[rgb(251,191,36)] transition-colors placeholder:text-[rgba(238,238,238,0.3)]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="reg-email" className="text-[14px] text-[rgba(238,238,238,0.7)]">
                Email <span className="text-[rgba(238,238,238,0.4)] text-[12px]">(tuỳ chọn)</span>
              </label>
              <input
                id="reg-email"
                type="email"
                name="email"
                placeholder="Nhập email (không bắt buộc)"
                className="w-full px-4 py-3 bg-[rgb(31,41,55)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] md:text-[16px] outline-none focus:border-[rgb(251,191,36)] transition-colors placeholder:text-[rgba(238,238,238,0.3)]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="reg-password" className="text-[14px] text-[rgba(238,238,238,0.7)]">
                Mật khẩu <span className="text-[rgb(220,38,38)]">*</span>
              </label>
              <input
                id="reg-password"
                type="password"
                name="password"
                required
                placeholder="Tối thiểu 6 ký tự"
                className="w-full px-4 py-3 bg-[rgb(31,41,55)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] md:text-[16px] outline-none focus:border-[rgb(251,191,36)] transition-colors placeholder:text-[rgba(238,238,238,0.3)]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="reg-confirm" className="text-[14px] text-[rgba(238,238,238,0.7)]">
                Xác nhận mật khẩu <span className="text-[rgb(220,38,38)]">*</span>
              </label>
              <input
                id="reg-confirm"
                type="password"
                name="confirmPassword"
                required
                placeholder="Nhập lại mật khẩu"
                className="w-full px-4 py-3 bg-[rgb(31,41,55)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] md:text-[16px] outline-none focus:border-[rgb(251,191,36)] transition-colors placeholder:text-[rgba(238,238,238,0.3)]"
              />
            </div>
            <button
              id="btn-register"
              type="submit"
              disabled={isPending}
              className="w-full py-3 mt-2 bg-[rgb(202,138,4)] hover:bg-[rgb(251,191,36)] disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold text-[16px] md:text-[18px] rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang đăng ký...
                </>
              ) : (
                "Đăng Ký"
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[rgb(75,85,99)]" />
          </div>
          <div className="relative flex justify-center text-[12px]">
            <span className="bg-[rgb(2,6,23)] px-3 text-[rgba(238,238,238,0.5)]">
              hoặc
            </span>
          </div>
        </div>

        {/* Google Login */}
        <button
          id="btn-google-login"
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 border border-[rgb(75,85,99)] hover:border-[rgb(251,191,36)] text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Đăng nhập bằng Google
        </button>

        {/* Session info */}
        <div className="mt-5 flex items-center gap-2 justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[rgba(238,238,238,0.4)]">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          <span className="text-[12px] text-[rgba(238,238,238,0.4)]">Phiên đăng nhập tự động hết hạn sau 10 phút</span>
        </div>

        <p className="text-center mt-4 text-[14px] text-[rgba(238,238,238,0.7)]">
          {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[rgb(251,191,36)] font-semibold hover:underline"
          >
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </p>
      </div>

      {showWebViewModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 animate-fade-in" onClick={() => setShowWebViewModal(false)}>
          <div className="relative bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-2xl p-6 max-w-[340px] w-full text-center shadow-[0_0_30px_rgba(251,191,36,0.2)] animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-[rgba(251,191,36,0.1)] border border-[rgb(251,191,36)] flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-[rgb(251,191,36)]">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-[rgb(251,191,36)] font-bold text-[16px] mb-3">Đăng Nhập Bằng Google</h4>
            <p className="text-gray-300 text-[13px] leading-relaxed mb-5">
              Google không hỗ trợ trình duyệt nhúng của ứng dụng Zalo / Facebook.<br/><br/>
              Vui lòng bấm vào <strong>biểu tượng 3 dấu chấm</strong> ở góc trên bên phải màn hình và chọn <strong>"Mở bằng Safari"</strong> để tiếp tục.
            </p>
            <button 
              onClick={() => setShowWebViewModal(false)}
              className="w-full py-2.5 bg-[rgb(202,138,4)] hover:bg-[rgb(251,191,36)] text-black font-bold text-[14px] rounded-lg transition-colors cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
