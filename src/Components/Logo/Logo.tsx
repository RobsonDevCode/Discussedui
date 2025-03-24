// Regular image import
import discussedLogoSrc from './assets/discussed-logo.svg';

export function Header() {
  return (
    <header>
      <img src={discussedLogoSrc} alt="Discussed Logo" width="150" height="150" />
    </header>
  );
}