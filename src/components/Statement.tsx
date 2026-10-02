import { Reveal } from "./Reveal";
import { ScrollScale } from "./ScrollScale";
import { Logo } from "./Logo";

export function Statement() {
  return (
    <section className="section section--white statement" aria-label="Por que NXU">
      <div className="container">
        <div className="statement__block">
          <ScrollScale from={0.88}>
            <h2 className="display">
              <span className="line">Você não precisa</span>
              <span className="line">de mais uma marca fitness.</span>
            </h2>
          </ScrollScale>
        </div>

        <div className="statement__block statement__block--short">
          <Reveal as="p" className="statement__whisper" amount={1} duration={1.2}>
            Nós sabemos.
          </Reveal>
        </div>

        <div className="statement__final">
          <Reveal as="h2" className="display" amount={0.6}>
            <span className="line">Por isso não estamos</span>
            <span className="line">criando mais uma.</span>
          </Reveal>
          <Reveal amount={0.8} delay={0.2}>
            <span className="signature">
              <Logo className="signature__mark" />
              <span className="signature__sub">Next You.</span>
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
