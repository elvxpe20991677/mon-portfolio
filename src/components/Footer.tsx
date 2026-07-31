export default function Footer() {
  return (
    <footer className="flex flex-col items-center gap-6 border-t border-zinc-800 px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-widest text-muted">
        Un projet en tête ?
      </p>
      <h2 className="font-display text-3xl font-bold uppercase leading-tight text-foreground sm:text-5xl">
        Travaillons
        <br />
        Ensemble
      </h2>
      <a
        href="mailto:perros.elvis@gmail.com"
        data-cursor="link"
        className="border-b-2 border-zinc-700 pb-1 text-lg text-foreground transition-colors hover:border-accent sm:text-2xl"
      >
        perros.elvis@gmail.com
      </a>
      <p className="mt-6 text-xs text-muted">
        © 2026 Elvis Perros. Tous droits réservés.
      </p>
    </footer>
  );
}
