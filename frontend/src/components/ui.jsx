import { clsx } from 'clsx';

export function cx(...args) {
  return clsx(...args);
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none';
  const sizes = {
    sm: 'h-8 px-3 text-[13px] rounded-lg',
    md: 'h-10 px-4 text-[14px] rounded-lg',
    lg: 'h-12 px-5 text-[15px] rounded-xl',
  };
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    accent: 'bg-accent text-white hover:opacity-90',
    danger: 'bg-highlight text-white hover:opacity-90',
    outline: 'border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 bg-transparent',
    outlineWhite: 'border border-white/30 text-white hover:bg-white/10 bg-transparent',
    ghost: 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 bg-transparent',
    ghostWhite: 'text-white/90 hover:bg-white/10 bg-transparent',
    ghostDanger: 'text-highlight hover:bg-highlight-light dark:hover:bg-highlight/10 bg-transparent',
  };
  return (
    <button className={cx(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function Badge({ color = 'gray', className = '', children }) {
  const palette = {
    primary: 'bg-primary-light text-primary-dark dark:bg-primary/20 dark:text-primary-light',
    accent:  'bg-accent-light text-accent dark:bg-accent/20 dark:text-accent',
    highlight: 'bg-highlight-light text-highlight dark:bg-highlight/20 dark:text-highlight',
    gray:    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  return (
    <span className={cx('inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[12px] font-medium', palette[color], className)}>
      {children}
    </span>
  );
}

export function Card({ className = '', children, ...props }) {
  return (
    <div className={cx('bg-white dark:bg-carddark border border-gray-200 dark:border-gray-800 rounded-xl', className)} {...props}>
      {children}
    </div>
  );
}

export function Avatar({ name = '', size = 32, className = '' }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
  return (
    <div
      className={cx('bg-primary rounded-full flex items-center justify-center font-medium text-white select-none', className)}
      style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initials}
    </div>
  );
}

export function Toast({ tone = 'info', message, onClose }) {
  const palette = {
    success: 'bg-accent text-white',
    error:   'bg-highlight text-white',
    info:    'bg-primary text-white',
  };
  return (
    <div className={cx('toast-in flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium min-w-[260px] max-w-[360px]', palette[tone])}>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-70 hover:opacity-100">✕</button>
      )}
    </div>
  );
}

export function ConfirmDialog({ open, title, body, onCancel, onConfirm, confirmLabel = 'Delete', danger = true }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-carddark border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-[380px]">
        <h3 className="text-[18px] font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-[14px] text-gray-500 dark:text-gray-400">{body}</p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="outline" size="md" onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} size="md" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

const COVER_STYLES = {
  paris:   'linear-gradient(135deg,#3F3580 0%, #6E5FB8 45%, #C29CD8 100%)',
  nyc:     'linear-gradient(135deg,#0F2543 0%, #2A5C9B 50%, #F0B45A 100%)',
  tokyo:   'linear-gradient(135deg,#1B1B2F 0%, #8E2C5C 50%, #E94560 100%)',
  lisbon:  'linear-gradient(135deg,#0E5C5C 0%, #2BA08B 50%, #FFD58C 100%)',
  iceland: 'linear-gradient(135deg,#1B3A57 0%, #3E7CB1 50%, #A7D6E2 100%)',
  rome:    'linear-gradient(135deg,#4C2A1A 0%, #B8732E 50%, #F0CB7E 100%)',
  default: 'linear-gradient(135deg,#534AB7 0%, #8B82D4 100%)',
};

export function CoverPhoto({ src, kind = 'default', className = '', children }) {
  if (src) {
    return (
      <div className={cx('relative overflow-hidden', className)}>
        <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
        {children}
      </div>
    );
  }
  const bg = COVER_STYLES[kind] || COVER_STYLES.default;
  return (
    <div className={cx('relative overflow-hidden', className)} style={{ background: bg }}>
      <div className="absolute inset-0"
           style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)', backgroundSize: '14px 14px', opacity: 0.4 }} />
      {children}
    </div>
  );
}
