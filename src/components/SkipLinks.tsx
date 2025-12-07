export function SkipLinks() {
  return (
    <nav aria-label="Links de navegação rápida" className="skip-links">
      <a
        href="#main-content"
        className="skip-link"
        tabIndex={0}
      >
        Ir para o conteúdo principal
      </a>
      <a
        href="#main-navigation"
        className="skip-link"
        style={{ left: "220px" }}
        tabIndex={0}
      >
        Ir para a navegação
      </a>
      <a
        href="#accessibility-settings"
        className="skip-link"
        style={{ left: "380px" }}
        tabIndex={0}
      >
        Configurações de acessibilidade
      </a>
    </nav>
  );
}
