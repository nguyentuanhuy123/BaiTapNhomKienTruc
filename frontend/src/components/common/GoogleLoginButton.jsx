import { useEffect, useRef } from 'react';

/**
 * GoogleLoginButton — dùng Google Identity Services (GSI) script tag.
 * Không cần cài thêm npm package nào.
 *
 * Cần thêm VITE_GOOGLE_CLIENT_ID vào ..env:
 *   VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
 *
 * @param {Function} onSuccess - Nhận idToken (string) khi đăng nhập thành công
 * @param {Function} onError   - Nhận error message khi thất bại
 * @param {string}   text      - "signin_with" | "signup_with" | "continue_with"
 */
const GoogleLoginButton = ({ onSuccess, onError, text = 'signin_with' }) => {
    const containerRef = useRef(null);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    useEffect(() => {
        if (!clientId) {
            console.warn('[Google] Thiếu VITE_GOOGLE_CLIENT_ID trong ..env');
            return;
        }

        // Load Google GSI script nếu chưa có
        const existingScript = document.getElementById('google-gsi-script');
        const initGoogle = () => {
            if (!window.google || !containerRef.current) return;

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: (response) => {
                    if (response?.credential) {
                        onSuccess(response.credential); // đây là idToken
                    } else {
                        onError?.('Không nhận được credential từ Google');
                    }
                },
                auto_select: false,
                cancel_on_tap_outside: true,
            });

            window.google.accounts.id.renderButton(containerRef.current, {
                type:   'standard',
                theme:  'outline',
                size:   'large',
                text:   text,
                shape:  'rectangular',
                width:  '100%',
                logo_alignment: 'left',
            });
        };

        if (existingScript) {
            // Script đã load → khởi tạo ngay
            if (window.google) initGoogle();
            else existingScript.addEventListener('load', initGoogle);
        } else {
            const script = document.createElement('script');
            script.id  = 'google-gsi-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initGoogle;
            document.head.appendChild(script);
        }

        return () => {
            // Cleanup rendered button
            if (containerRef.current) containerRef.current.innerHTML = '';
        };
    }, [clientId, onSuccess, onError, text]);

    if (!clientId) {
        return (
            <div className="w-full py-4 border border-amber-200 bg-amber-50 rounded-2xl text-center text-xs text-amber-600 font-bold">
                ⚠ Thiếu VITE_GOOGLE_CLIENT_ID trong .env
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full flex justify-center [&>div]:w-full [&_iframe]:w-full"
            style={{ minHeight: 44 }}
        />
    );
};

export default GoogleLoginButton;
