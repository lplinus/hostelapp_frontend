"use client";

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export default function RecaptchaWrapper({ children }: { children: React.ReactNode }) {
    const envKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
    const siteKey = envKey.length > 0 && !envKey.startsWith("YOUR_") ? envKey : "YOUR_TEST_SITE_KEY";

    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={siteKey}
            scriptProps={{
                async: false,
                defer: false,
                appendTo: "head",
                nonce: undefined,
            }}
        >
            {children}
        </GoogleReCaptchaProvider>
    );
}
