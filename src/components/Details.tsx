import { images } from "@/config/site";
import { EditorialImage } from "./EditorialImage";
import { Reveal } from "./Reveal";

export function Details() {
  return (
    <section className="section" aria-labelledby="details-title">
      <div className="container">
        <div className="details__head">
          <Reveal as="h2" className="title">
            <span id="details-title">
              <span className="line">Details</span>
              <span className="line">matter.</span>
            </span>
          </Reveal>
          <Reveal as="p" className="muted" delay={0.15}>
            Porque a diferença está justamente no que quase ninguém percebe.
          </Reveal>
        </div>

        <div className="details__rail">
          {images.details.map((img, i) => (
            <Reveal as="figure" key={img.label} className="details__item" delay={i * 0.12} amount={0.2} blur={false} y={48} duration={1.3}>
              <EditorialImage
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(min-width: 900px) 30vw, 82vw"
                tag={`0${i + 1}`}
              />
              <figcaption>
                <span>0{i + 1}</span>
                <span>{img.label}</span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
