const Icon = ({ d, size = 18, stroke = 1.6, className = '', children, viewBox = '0 0 24 24' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox={viewBox}
       fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
       className={className}>
    {d ? <path d={d} /> : children}
  </svg>
);

export const IconMapPin = (p) => <Icon {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></Icon>;
export const IconChevronRight = (p) => <Icon {...p} d="M9 6l6 6-6 6" />;
export const IconArrowRight = (p) => <Icon {...p}><path d="M5 12h14" /><path d="M13 5l7 7-7 7" /></Icon>;
export const IconArrowLeft  = (p) => <Icon {...p}><path d="M19 12H5" /><path d="M11 5l-7 7 7 7" /></Icon>;
export const IconCheck  = (p) => <Icon {...p} d="M20 6L9 17l-5-5" />;
export const IconPlus   = (p) => <Icon {...p}><path d="M12 5v14" /><path d="M5 12h14" /></Icon>;
export const IconMinus  = (p) => <Icon {...p} d="M5 12h14" />;
export const IconTrash  = (p) => <Icon {...p}><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></Icon>;
export const IconStar   = (p) => <Icon {...p} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
export const IconCalendar = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></Icon>;
export const IconClock  = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Icon>;
export const IconWallet = (p) => <Icon {...p}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4z" /></Icon>;
export const IconGem    = (p) => <Icon {...p}><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M11 3L8 9l4 13 4-13-3-6" /><path d="M2 9h20" /></Icon>;
export const IconUser   = (p) => <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Icon>;
export const IconUsers  = (p) => <Icon {...p}><circle cx="9" cy="8" r="4" /><path d="M1 21a8 8 0 0 1 16 0" /><circle cx="17" cy="6" r="3" /><path d="M23 19a6 6 0 0 0-6-6" /></Icon>;
export const IconHeart  = (p) => <Icon {...p} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />;
export const IconHome   = (p) => <Icon {...p}><path d="M3 12l9-9 9 9" /><path d="M5 10v10h14V10" /></Icon>;
export const IconUtensils = (p) => <Icon {...p}><path d="M3 2v7a3 3 0 0 0 3 3v10" /><path d="M6 2v10" /><path d="M9 2v7a3 3 0 0 1-3 3" /><path d="M15 14V2a3 3 0 0 1 3 3v9h-3z" /><path d="M15 14v8" /></Icon>;
export const IconSun    = (p) => <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></Icon>;
export const IconMoon   = (p) => <Icon {...p} d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />;
export const IconSparkles = (p) => <Icon {...p}><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" /><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" /></Icon>;
export const IconCompass = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><path d="M16 8l-2 6-6 2 2-6z" /></Icon>;
export const IconRoute  = (p) => <Icon {...p}><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" /><path d="M18 8v6a4 4 0 0 1-4 4H9" /></Icon>;
export const IconMap    = (p) => <Icon {...p}><path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v16M15 6v16" /></Icon>;
export const IconLayers = (p) => <Icon {...p}><path d="M12 2l10 6-10 6L2 8z" /><path d="M2 14l10 6 10-6" /></Icon>;
export const IconX      = (p) => <Icon {...p}><path d="M18 6L6 18M6 6l12 12" /></Icon>;
export const IconAlert  = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h0" /></Icon>;
export const IconWalking = (p) => <Icon {...p}><circle cx="13" cy="4" r="2" /><path d="M9 22l3-7 2 2 3-3M11 13l-2 4-4-1M14 9l3 1 2-3" /></Icon>;
export const IconExternal = (p) => <Icon {...p}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6M10 14L21 3" /></Icon>;
export const IconDownload = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Icon>;

export const IconGoogle = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.3l-6.2-5.2C29.5 35 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C39.9 36 44 30.6 44 24c0-1.2-.1-2.3-.4-3.5z"/>
  </svg>
);
