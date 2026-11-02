const EMAIL = "elvis.perros.video@gmail.com";
const INSTAGRAM_URL = "https://www.instagram.com/3lvx.p/";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="flex flex-col items-center gap-6 border-t border-zinc-800 px-6 py-24 text-center"
    >
      <p className="text-xs uppercase tracking-widest text-muted">
        Un projet en tête ?
      </p>
      <h2 className="font-display text-3xl font-bold uppercase leading-tight text-foreground sm:text-5xl">
        Travaillons
        <br />
        Ensemble
      </h2>
      <a
        href={`mailto:${EMAIL}`}
        data-cursor="link"
        className="break-all border-b-2 border-zinc-700 pb-1 text-lg text-foreground transition-colors hover:border-accent sm:text-2xl"
      >
        {EMAIL}
      </a>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="link"
        className="text-sm text-muted transition-colors hover:text-foreground sm:text-base"
      >
        Instagram <span className="text-foreground">@3lvx.p</span>
      </a>
      <p className="mt-6 text-xs text-muted">
        © 2026 Elvis Perros. Tous droits réservés.
      </p>
    </footer>
  );
}
