"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { logger } from "@/lib/logger";

export function ReCaptchaProvider({ children }: { children: React.ReactNode }) {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
        logger.warn({ action: "init_recaptcha" }, "reCAPTCHA site key is missing. Validation will fail on the server.");
        // We still render children so the app doesn't crash, but recaptcha won't work
        return <>{children}</>;
    }

    return (
        <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
            {children}
        </GoogleReCaptchaProvider>
    );
}
