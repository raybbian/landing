const borderStatusColors = {
    "success": "border-ctp-green",
    "info": "border-ctp-blue",
    "warning": "border-ctp-yellow",
    "error": "border-ctp-red",
    "default": "border-ctp-surface0",
}

const textStatusColors = {
    "success": "text-ctp-green",
    "info": "text-ctp-blue",
    "warning": "text-ctp-yellow",
    "error": "text-ctp-red",
    "default": "text-ctp-surface0",
}

export const allBgAccentColors = [
    "bg-ctp-rosewater",
    "bg-ctp-flamingo",
    "bg-ctp-pink",
    "bg-ctp-mauve",
    "bg-ctp-red",
    "bg-ctp-maroon",
    "bg-ctp-peach",
    "bg-ctp-yellow",
    "bg-ctp-green",
    "bg-ctp-teal",
    "bg-ctp-sky",
    "bg-ctp-sapphire",
    "bg-ctp-blue",
    "bg-ctp-lavender",
]

export type status = "success" | "info" | "warning" | "error" | "default";

export function getBorderStatusColor(status: status): string {
    return borderStatusColors[status];
}

export function getTextStatusColor(status: status): string {
    return textStatusColors[status];
}
