// Ícones de traço único — herdam a cor via currentColor.
const base = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true
};

export const IconTraining = () => (
    <svg {...base}><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11" /></svg>
);

export const IconQuest = () => (
    <svg {...base}><path d="M9 4h6a2 2 0 0 1 2 2v14l-5-3-5 3V6a2 2 0 0 1 2-2z" /><path d="M10 9l1.5 1.5L14 8" /></svg>
);

export const IconStatus = () => (
    <svg {...base}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>
);

export const IconCrown = () => (
    <svg {...base}><path d="M3 7l4.5 4L12 5l4.5 6L21 7l-2 12H5z" /></svg>
);

export const IconSettings = () => (
    <svg {...base}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
);

export const IconLogout = () => (
    <svg {...base}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
);

export const IconMenu = () => (
    <svg {...base}><path d="M4 7h16M4 12h16M4 17h10" /></svg>
);

export const IconClose = () => (
    <svg {...base}><path d="M18 6 6 18M6 6l12 12" /></svg>
);

export const IconCheck = () => (
    <svg {...base} strokeWidth={3}><path d="M20 6 9 17l-5-5" /></svg>
);

export const IconPlus = () => (
    <svg {...base}><path d="M12 5v14M5 12h14" /></svg>
);

export const IconTrash = () => (
    <svg {...base}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
);

export const IconBell = () => (
    <svg {...base}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
);

export const IconEye = () => (
    <svg {...base}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
);

export const IconEyeOff = () => (
    <svg {...base}><path d="M17.9 17.9A10.9 10.9 0 0 1 12 19C5 19 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A10 10 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22" /></svg>
);
