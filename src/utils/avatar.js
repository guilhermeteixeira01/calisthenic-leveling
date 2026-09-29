import DEFAULT_AVATAR_SRC from "../assets/img/avatar-default.svg";

// Avatar padrão local (silhueta estilo "Monarca das Sombras").
export const DEFAULT_AVATAR = DEFAULT_AVATAR_SRC;

// onError de <img>: troca para o avatar padrão quando a foto do usuário falha.
export function handleAvatarError(e) {
    const img = e.currentTarget;
    if (img.getAttribute("src") === DEFAULT_AVATAR) return;
    img.src = DEFAULT_AVATAR;
}
