import { themeService } from './themeService';
import { ColorScheme, getDefaultColors, isDark } from './default-colors';

const styleSheet = document.getElementById('dynamic-theme-colors') as HTMLStyleElement;

let currentMergedColors: Record<string, string> = {};

const themeColorMeta = document.head.querySelector('meta[name="theme-color"]')!;

function registerThemeColors(theme: any) {
  currentMergedColors = {
    ...getDefaultColors(theme.type as ColorScheme),
    ...theme.themeData.colors,
  };
  let styleSheetContent = `:root {`;

  for (const colorId in currentMergedColors) {
    styleSheetContent += `--color-${colorId.replace(
      /\./g,
      '-'
    )}: ${currentMergedColors[colorId].toString()};`;
  }

  styleSheetContent += '}';
  styleSheet.innerHTML = styleSheetContent;

  if (isDark(theme.type)) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }

  updateTitleBarColor();
}

const menubarContainer = document.getElementById('menubar-container')!;

function updateTitleBarColor() {
  const color =
    currentMergedColors[
      document.hasFocus() ? 'titleBar.activeBackground' : 'titleBar.inactiveBackground'
    ];
  themeColorMeta.setAttribute('content', color.toString());

  menubarContainer.style.backgroundColor = color.toString();
}

registerThemeColors(themeService.getColorTheme());
themeService.onDidColorThemeChange(registerThemeColors);

window.addEventListener('focus', updateTitleBarColor);
window.addEventListener('blur', updateTitleBarColor);
