import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

export default function HeaderControls() {
  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <LanguageToggle />
      <ThemeToggle />
    </div>
  );
}

