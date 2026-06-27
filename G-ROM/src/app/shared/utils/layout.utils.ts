export type LayoutTheme = 'default' | 'light' | 'dark';

const normalizePageTitle = (pageTitle?: string): string => {
  if (!pageTitle) {
    return 'default';
  }

  return pageTitle
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export function buildAppLayoutClass(
  pageTitle?: string,
  themeClass: LayoutTheme | string = 'default'
): string {
  const pageClass = normalizePageTitle(pageTitle);
  const themeClassName = themeClass ? `theme-${themeClass}` : 'theme-default';

  return ['app-shell', pageClass, themeClassName].filter(Boolean).join(' ');
}

export function buildPageContainerClass(pageTitle?: string): string {
  const pageClass = normalizePageTitle(pageTitle);
  return ['page-container', `${pageClass}-container`].filter(Boolean).join(' ');
}
