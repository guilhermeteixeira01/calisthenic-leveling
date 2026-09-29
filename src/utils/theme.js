// Temas salvos no Firestore (campo "theme"). As chaves são mantidas para
// compatibilidade com usuários existentes; as cores ficam em css/base.css.
export const THEMES_PUBLIC = ["dark", "light"];
export const THEMES_VIP = ["vip-theme", "anime"];

export const THEME_LABELS = {
    dark: "Sistema (Azul)",
    light: "Monarca das Sombras (Roxo)",
    "vip-theme": "Monarca Dourado (VIP)",
    anime: "Despertar (VIP)"
};

export function resolveTheme(userData) {
    const isVIP = userData?.cargo === "vip";
    return userData?.theme || (isVIP ? "vip-theme" : "dark");
}

export function applyTheme(theme) {
    document.documentElement.dataset.theme = theme || "dark";
}
