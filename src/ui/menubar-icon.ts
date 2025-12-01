import './menubar-icon.css';

const wco = (navigator as any).windowControlsOverlay as any;

const menubarIcon = document.querySelector(
  '#menubar-container > .icon'
) as HTMLElement;

function setIconVisibility() {
  menubarIcon.style.display = wco?.visible ? 'flex' : 'none';
}

if (wco) {
  setIconVisibility();
  wco.addEventListener('geometrychange', setIconVisibility);
}
