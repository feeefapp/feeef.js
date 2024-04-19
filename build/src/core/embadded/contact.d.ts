export declare enum EmbaddedContactType {
    phone = "phone",
    email = "email",
    facebook = "facebook",
    twitter = "twitter",
    instagram = "instagram",
    linkedin = "linkedin",
    website = "website",
    whatsapp = "whatsapp",
    telegram = "telegram",
    signal = "signal",
    viber = "viber",
    skype = "skype",
    zoom = "zoom",
    other = "other"
}
export interface EmbaddedContact {
    type: EmbaddedContactType;
    value: string;
    metadata?: Record<string, any>;
}
