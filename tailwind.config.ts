import type {Config} from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [
        require("@catppuccin/tailwindcss")({
            // prefix to use, e.g. `text-pink` becomes `text-ctp-pink`.
            // default is `false`, which means no prefix
            prefix: "ctp",
            // which flavour of colours to use by default, in the `:root`
            defaultFlavour: "frappe",
        }),
    ],
};
export default config;
