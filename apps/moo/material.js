(function () {
  function buildClassName(extraClass) {
    return ['material-symbols-outlined', extraClass].filter(Boolean).join(' ');
  }

  function createMaterialIcon(name, extraClass) {
    const span = document.createElement('span');
    span.className = buildClassName(extraClass);
    span.setAttribute('aria-hidden', 'true');
    span.textContent = name;
    return span;
  }

  function materialIcon(name, extraClass) {
    return `<span class="${buildClassName(extraClass)}" aria-hidden="true">${name}</span>`;
  }

  function setMaterialIcon(target, name, extraClass) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) {
      return null;
    }

    element.className = buildClassName(extraClass);
    element.setAttribute('aria-hidden', 'true');
    element.textContent = name;
    return element;
  }

  window.materialIcon = materialIcon;
  window.createMaterialIcon = createMaterialIcon;
  window.setMaterialIcon = setMaterialIcon;
})();
