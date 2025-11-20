interface Target {
  applyEvent: (callback: () => void) => void;
}

export function registerEvent(callback: () => void, targets: Target[]) {
  for (let i = 0; i < targets.length; i++) {
    targets[i].applyEvent(callback);
  }
}

export function keyboardTarget(
  key: string,
  options: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}
): Target {
  return {
    applyEvent(callback) {
      window.addEventListener(
        'keydown',
        (e) => {
          if (
            e.key.toLowerCase() === key.toLowerCase() &&
            (options.ctrl ? e.ctrlKey : true) &&
            (options.shift ? e.shiftKey : true) &&
            (options.alt ? e.altKey : true)
          ) {
            e.preventDefault();
            callback();
          }
        },
        { passive: false }
      );
    },
  };
}

export function clickTarget(specifier: string | HTMLElement[]): Target {
  if (typeof specifier === 'string') {
    return {
      applyEvent(callback) {
        const elements = document.querySelectorAll(`[data-onclick="${specifier}"]`);
        for (let i = 0; i < elements.length; i++) {
          elements[i].addEventListener('click', () => {
            callback();
          });
        }
      },
    };
  } else {
    return {
      applyEvent(callback) {
        for (let i = 0; i < specifier.length; i++) {
          specifier[i].addEventListener('click', () => {
            callback();
          });
        }
      },
    };
  }
}
