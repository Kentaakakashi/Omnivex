import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Compass, Fingerprint, Orbit, ShieldCheck, Sparkles } from "lucide-react";
import PixelBlast from "../../components/react-bits/backgrounds/PixelBlast.jsx";
import LaserFlow from "../../components/react-bits/backgrounds/LaserFlow.jsx";
import AccordionGallery from "../../components/react-bits/galleries/AccordionGallery.jsx";
import Carousel from "../../components/react-bits/galleries/Carousel.jsx";

const artwork = {
  spider: "https://commons.wikimedia.org/wiki/Special:FilePath/Spider-Man%20cosplay.jpg",
  batman: "https://commons.wikimedia.org/wiki/Special:FilePath/PA%20comic%20convention%20Cosplay%20of%20Batman.jpg",
  goku: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Cosplayer_of_Goku%2C_Dragon_Ball_Z_at_CWT16_20070812.jpg/960px-Cosplayer_of_Goku%2C_Dragon_Ball_Z_at_CWT16_20070812.jpg",
  naruto: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Group_Portrait_of_Naruto_Cosplayers_at_CWT40_20150809.jpg/1280px-Group_Portrait_of_Naruto_Cosplayers_at_CWT40_20150809.jpg",
  kratos: "https://commons.wikimedia.org/wiki/Special:FilePath/Kratos%20Cosplayer%20at%20Lucca%20Comics%20%26%20Games%202014.jpg",
  poseidon: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Statue_of_Poseidon_with_Parian_marble.jpg/1280px-Statue_of_Poseidon_with_Parian_marble.jpg",
  marvel: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Cosplay_of_Female_Loki%2C_Hawkeye_and_Captain_America_at_the_2011_New_York_Comic_Con.jpg/1280px-Cosplay_of_Female_Loki%2C_Hawkeye_and_Captain_America_at_the_2011_New_York_Comic_Con.jpg"
};

const universeItems = [
  { label: "MARVEL", image: artwork.marvel, alt: "Marvel character cosplay photograph", link: "/universes/marvel" },
  { label: "DC", image: artwork.batman, alt: "Batman cosplay photograph", link: "/universes/dc" },
  { label: "DRAGON BALL", image: artwork.goku, alt: "Goku cosplay photograph", link: "/universes/dragon-ball" },
  { label: "NARUTO", image: artwork.naruto, alt: "Group cosplay photograph from Naruto", link: "/universes/naruto" },
  { label: "GOD OF WAR", image: artwork.kratos, alt: "Kratos cosplay photograph", link: "/universes/god-of-war" },
  { label: "MYTHOLOGY", image: artwork.poseidon, alt: "Photograph of an ancient marble statue of Poseidon", link: "/universes/mythology" }
];

function useCompactGallery() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 720px)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);
  return compact;
}

function Hero() {
  return (
    <section className="home-hero">
      <div className="home-hero__copy">
        <span className="eyebrow-tag"><span className="eyebrow-tag__dot" /> THE MULTIVERSE FIELD ATLAS</span>
        <h1>One index.<br /><em>Countless worlds.</em></h1>
        <p className="home-hero__lead">Explore identities across universes. Compare exact versions. Follow every important claim back to its source.</p>
        <div className="home-hero__actions">
          <Link className="atlas-button atlas-button--dark" to="/discover">Start exploring <ArrowUpRight size={16} /></Link>
          <Link className="atlas-text-link" to="/matchups/create">Build a matchup <ArrowRight size={16} /></Link>
        </div>
        <div className="hero-principles">
          <span><ShieldCheck size={15} /> Evidence-led</span>
          <span><Fingerprint size={15} /> Version-aware</span>
          <span><Orbit size={15} /> Universe-spanning</span>
        </div>
        <div className="hero-index-note"><span>01 / 03</span><i /> DISCOVER · INVESTIGATE · COMPARE</div>
      </div>
      <div className="home-hero__visual">
        <div className="home-hero__pixel-fallback" aria-hidden="true" />
        <div className="home-hero__pixel-layer" aria-hidden="true">
          <PixelBlast
            variant="square"
            pixelSize={3.5}
            color="#789C9A"
            accentColor="#42BFC0"
            patternScale={2.2}
            patternDensity={0.7}
            enableRipples
            rippleIntensityScale={0.6}
            speed={0.22}
            transparent
            edgeFade={0.7}
            glow={0.35}
            twinkle={0.12}
            drift={0.12}
            hoverEffect="reveal"
            hoverRadius={120}
            autoPauseOffscreen
            dpr={1}
          />
        </div>
        <div className="hero-visual__grid" aria-hidden="true" />
        <div className="hero-visual__orb hero-visual__orb--one" aria-hidden="true" />
        <div className="hero-visual__orb hero-visual__orb--two" aria-hidden="true" />
        <div className="hero-art-card hero-art-card--back">
          <img src={artwork.batman} alt="Batman cosplay reference photograph" loading="lazy" />
          <span>DC / PRIME EARTH</span>
        </div>
        <div className="hero-art-card hero-art-card--front">
          <img src={artwork.spider} alt="Spider-Man cosplay reference photograph" fetchPriority="high" />
          <span>MARVEL / EARTH-616</span>
        </div>
        <div className="hero-visual__label hero-visual__label--top"><span>FIELD NOTES</span><b>INDEX / 0001</b></div>
        <div className="hero-visual__label hero-visual__label--bottom"><span>COMMUNITY PHOTO REFERENCES</span><b>NOT OFFICIAL CHARACTER ART</b></div>
        <div className="hero-visual__side-mark" aria-hidden="true">OMNIVEX <i>×</i> 001</div>
      </div>
    </section>
  );
}

function FeaturedUniverses() {
  const navigate = useNavigate();
  const compact = useCompactGallery();
  return (
    <section className="atlas-section universe-feature">
      <div className="section-heading">
        <div>
          <span className="section-kicker">01 / OPEN THE ATLAS</span>
          <h2>Worlds worth <em>getting lost in.</em></h2>
          <p>A few entry points into the wider index. Each world has its own hub, identities and continuities.</p>
        </div>
        <Link className="section-corner-link" to="/universes">Explore all universes <ArrowUpRight size={15} /></Link>
      </div>
      <AccordionGallery
        items={universeItems}
        defaultIndex={0}
        accentColor="#F7F9F8"
        overlayColor="#13242D"
        textColor="#F7F9F8"
        height={compact ? 292 : 390}
        gap={8}
        radius={7}
        expandRatio={0.46}
        orientation={compact ? "vertical" : "horizontal"}
        duration={0.65}
        ease="power3.out"
        parallax={0.42}
        tilt={5}
        stagger={0.045}
        trigger="hover"
        showLabels
        grayscale={false}
        className="omnivex-universe-gallery"
        onItemClick={item => navigate(item.link)}
      />
      <div className="gallery-caption">
        <span>SELECT A PANEL TO EXPAND</span>
        <span>PHOTOGRAPHIC REFERENCES · SEE IMAGE CREDITS</span>
      </div>
    </section>
  );
}

const spotlightSlides = [
  <article className="spotlight-slide" key="spider">
    <img src={artwork.spider} alt="Spider-Man cosplay photograph" loading="lazy" />
    <div className="spotlight-slide__shade" />
    <div className="spotlight-slide__copy">
      <span>ENTITY DOSSIER / PREVIEW</span>
      <h3>Spider-Man</h3>
      <p>One identity, many versions. Start with the Earth-616 record.</p>
      <Link to="/characters/spider-man">Open profile <ArrowUpRight size={14} /></Link>
    </div>
  </article>,
  <article className="spotlight-slide" key="batman">
    <img src={artwork.batman} alt="Batman cosplay photograph" loading="lazy" />
    <div className="spotlight-slide__shade" />
    <div className="spotlight-slide__copy">
      <span>ENTITY DOSSIER / PREVIEW</span>
      <h3>Batman</h3>
      <p>Preparation, equipment and continuity belong in the comparison.</p>
      <Link to="/characters/batman">Open profile <ArrowUpRight size={14} /></Link>
    </div>
  </article>,
  <article className="spotlight-slide" key="goku">
    <img src={artwork.goku} alt="Goku cosplay photograph" loading="lazy" />
    <div className="spotlight-slide__shade" />
    <div className="spotlight-slide__copy">
      <span>UNIVERSE / PREVIEW</span>
      <h3>Dragon Ball</h3>
      <p>Browse a universe through its entities, works and continuities.</p>
      <Link to="/universes/dragon-ball">Explore universe <ArrowUpRight size={14} /></Link>
    </div>
  </article>
];

function Spotlight() {
  return (
    <section className="atlas-section spotlight-section">
      <div className="section-heading section-heading--tight">
        <div>
          <span className="section-kicker">02 / THE EDITORIAL WINDOW</span>
          <h2>Worth a closer <em>look.</em></h2>
          <p>A rotating selection of profiles and worlds. Every item leads to its own destination.</p>
        </div>
        <span className="section-aside-note"><Sparkles size={15} /> CURATED DISCOVERY</span>
      </div>
      <div className="spotlight-layout">
        <div className="spotlight-intro">
          <span className="spotlight-intro__number">02—</span>
          <h3>There is always<br />more <em>beneath the surface.</em></h3>
          <p>Move beyond names and popularity. Open a record, inspect its context, then follow the relationships around it.</p>
          <Link className="atlas-text-link" to="/characters">Browse the directory <ArrowRight size={16} /></Link>
        </div>
        <div className="spotlight-carousel">
          <Carousel
            items={spotlightSlides}
            baseWidth={510}
            aspectRatio={1.16}
            peek={14}
            gap={16}
            radius={8}
            frame={false}
            effect="tilt"
            indicator="bars"
            arrows
            autoplay={false}
            loop
            draggable
            theme="light"
            className="omnivex-spotlight-carousel"
          />
        </div>
      </div>
    </section>
  );
}

function FeaturedMatchup() {
  return (
    <section className="matchup-feature">
      <div className="matchup-feature__backdrop" aria-hidden="true" />
      <div className="matchup-feature__laser">
        <LaserFlow
          beamPosition={0.5}
          surfaceLevel={0.84}
          color="#42BFC0"
          intensity={1.1}
          beamWidth={0.72}
          flare={0.9}
          spread={1.1}
          spill={0.65}
          fog={0.08}
          dust={0.35}
          streaks={0.45}
          dots={0.25}
          pulse={0.75}
          speed={0.55}
          seed={20}
          mouseInteraction={false}
          revealRadius={150}
          revealOpacity={0.25}
          theme="dark"
          dpr={1}
        />
      </div>
      <div className="matchup-feature__content">
        <div className="matchup-feature__header">
          <span className="section-kicker section-kicker--light">03 / FEATURED COMPARISON</span>
          <span className="matchup-feature__status"><i /> CONFIGURATION PREVIEW</span>
        </div>
        <div className="matchup-duel">
          <div className="matchup-duel__side matchup-duel__side--a">
            <img src={artwork.spider} alt="Spider-Man cosplay reference photograph" loading="lazy" />
            <div><span>MARVEL / EARTH-616</span><strong>SPIDER-MAN</strong></div>
          </div>
          <div className="matchup-duel__middle"><span>VS</span><i /></div>
          <div className="matchup-duel__side matchup-duel__side--b">
            <img src={artwork.batman} alt="Batman cosplay reference photograph" loading="lazy" />
            <div><span>DC / PRIME EARTH</span><strong>BATMAN</strong></div>
          </div>
        </div>
        <div className="matchup-feature__footer">
          <div>
            <span>THE QUESTION</span>
            <h3>Instinct vs preparation</h3>
            <p>Versions are named. Conditions still need to be set. No winner is implied.</p>
          </div>
          <Link to="/matchups/create" className="atlas-button atlas-button--light">Configure matchup <ArrowUpRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}

function PlatformPrinciples() {
  return (
    <section className="platform-principles">
      <div className="platform-principles__intro">
        <span className="section-kicker">THE OMNIVEX METHOD</span>
        <h2>Curiosity, with <em>receipts.</em></h2>
      </div>
      <div className="principle">
        <span className="principle__number">01</span>
        <BookOpen size={19} />
        <div><strong>Investigate the source</strong><p>Claims stay connected to their original context.</p></div>
      </div>
      <div className="principle">
        <span className="principle__number">02</span>
        <Fingerprint size={19} />
        <div><strong>Respect every version</strong><p>Continuity and incarnation are part of the question.</p></div>
      </div>
      <div className="principle">
        <span className="principle__number">03</span>
        <Compass size={19} />
        <div><strong>Leave room for unknowns</strong><p>When evidence is incomplete, inconclusive is valid.</p></div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="home-page">
      <Hero />
      <FeaturedUniverses />
      <Spotlight />
      <FeaturedMatchup />
      <PlatformPrinciples />
      <div className="home-bottom-cta">
        <div><span className="section-kicker">THE ATLAS IS OPEN</span><h2>Start with a question.</h2></div>
        <Link to="/discover" className="atlas-button atlas-button--dark">Explore OMNIVEX <ArrowDownRight size={16} /></Link>
      </div>
      <p className="image-disclosure">Temporary visual references are licensed photographs of cosplayers or historical artwork, not official promotional character renders. Image attribution and license details are recorded in the repository.</p>
    </div>
  );
}
