import { Reveal } from "./Reveal";

const LINES = ["Treinar muda você.", "Mover-se muda você.", "Escolher continuar muda você."];

export function Manifesto() {
  return (
    <section className="section section--dark manifesto" aria-label="Manifesto">
      <div className="container">
        <Reveal as="p" className="eyebrow manifesto__eyebrow">
          Next isn’t a place.
        </Reveal>

        <h2 className="display-xl manifesto__big">
          <Reveal as="span" className="line" delay={0.15} y={28}>
            Next
          </Reveal>
          <Reveal as="span" className="line" delay={0.3} y={28}>
            is you.
          </Reveal>
        </h2>

        <div className="manifesto__lines">
          {LINES.map((l) => (
            <Reveal key={l} as="p" className="lead" amount={0.8}>
              {l}
            </Reveal>
          ))}
          <Reveal as="p" className="lead muted" amount={0.8}>
            Nós apenas criamos o que acompanha essa transformação.
          </Reveal>
        </div>

        <Reveal className="manifesto__end" amount={0.6}>
          <span className="signature">
            <span className="signature__mark">NXU</span>
            <span className="signature__sub">Next You.</span>
          </span>
        </Reveal>
      </div>
    </section>
  );
}
