const borderStatusColors = {
    "success": "border-ctp-green",
    "info": "border-ctp-blue",
    "warning": "border-ctp-yellow",
    "error": "border-ctp-red",
    "default": "border-ctp-overlay0",
}

export type status = "success" | "info" | "warning" | "error" | "default";

export function getBorderStatusColor(status: status): string {
    return borderStatusColors[status];
}
