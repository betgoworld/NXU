import { images } from "@/config/site";
import { EditorialImage } from "./EditorialImage";
import { Reveal } from "./Reveal";

export function ProductReveal() {
  const img = images.hero;
  return (
    <section className="section" aria-labelledby="move-title">
      <div className="container reveal-grid">
        <Reveal y={40} amount={0.15} blur={false} duration={1.3}>
          <EditorialImage
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            sizes="(min-width: 900px) 66vw, 100vw"
            tag="NXU — 01"
          />
        </Reveal>
        <div className="reveal-grid__text">
          <Reveal as="h2" className="title">
            <span id="move-title">
              <span className="line">Designed</span>
              <span className="line">to move.</span>
            </span>
          </Reveal>
          <Reveal as="p" className="lead" delay={0.15}>
            Performance quando você precisa.
          </Reveal>
          <Reveal as="p" className="lead muted" delay={0.3}>
            Design quando você simplesmente quer vestir.
          </Reveal>
        </div>
      </div>
    </section>
  );
}
