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

  themeColorMeta.setAttribute(
    'content',
    currentMergedColors['titleBar.activeBackground'].toString()
  );
}

window.addEventListener('focus', () => {
  const titleBarActiveBackground = currentMergedColors['titleBar.activeBackground'];
  themeColorMeta.setAttribute('content', titleBarActiveBackground.toString());

  document.getElementById('menubar-container')!.style.backgroundColor =
    titleBarActiveBackground.toString();
});

window.addEventListener('blur', () => {
  const titleBarInactiveBackground = currentMergedColors['titleBar.inactiveBackground'];
  themeColorMeta.setAttribute('content', titleBarInactiveBackground.toString());

  document.getElementById('menubar-container')!.style.backgroundColor =
    titleBarInactiveBackground.toString();
});

registerThemeColors(themeService.getColorTheme());
themeService.onDidColorThemeChange(registerThemeColors);
