const menubar = document.getElementById('menubar')!;

let currentOpenSubmenu: HTMLUListElement | undefined;

function setCurrentOpenSubmenu(submenu: HTMLUListElement | undefined) {
  if (currentOpenSubmenu && currentOpenSubmenu !== submenu) {
    currentOpenSubmenu.classList.remove('visible');
  }

  submenu?.classList.add('visible');
  currentOpenSubmenu = submenu;
}

for (const li of menubar.children as Iterable<HTMLLIElement>) {
  li.addEventListener('mouseenter', () => {
    if (!currentOpenSubmenu) return;
    const submenu = li.querySelector('.submenu') as HTMLUListElement | null;
    setCurrentOpenSubmenu(submenu || undefined);
  });

  li.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).matches('#menubar .submenu button')) {
      if (currentOpenSubmenu) currentOpenSubmenu.classList.remove('visible');
      currentOpenSubmenu = undefined;
    }

    if (e.target === li || li.children[0] === e.target) {
      const submenu = li.querySelector('.submenu') as HTMLUListElement | null;
      if (submenu) {
        const isOpen = submenu.classList.contains('visible');
        setCurrentOpenSubmenu(isOpen ? undefined : submenu);
      }
    }
  });
}

menubar.addEventListener('focusout', () => {
  if (menubar.querySelector(':focus') || menubar.querySelector(':active')) return;

  setCurrentOpenSubmenu(undefined);
});
