export function SkipLinks() {
  return (
    <nav aria-label="Links de navegação rápida" className="skip-links">
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Ir para o conteúdo principal
      </a>
      <a
        href="#main-navigation"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-52 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Ir para a navegação
      </a>
    </nav>
  );
}
