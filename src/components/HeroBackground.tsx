export function HeroBackground() {
  return (
    <>
      <div className="hero-background" aria-hidden="true">
        <div className="hero-grid" />
        <div className="hero-geometry">
          <svg viewBox="0 0 760 760" fill="none" aria-hidden="true">
            <path className="hero-geometry-plane" d="M380 32 690 211v358L380 748 70 569V211L380 32Z" />
            <path d="M380 32v358m310-179L380 390 70 211m0 358 310-179 310 179M225 121l310 537M535 121 225 658" />
            <path className="hero-geometry-core" d="m380 158 201 116v232L380 622 179 506V274L380 158Z" />
            <path className="hero-geometry-detail" d="m380 235 134 77v156l-134 77-134-77V312l134-77Zm0 0v310M246 312l268 156m0-156L246 468" />
          </svg>
        </div>
        <div className="hero-glow" />
        <svg className="hero-smoke hero-smoke-back" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="hero-smoke-back-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency=".009 .018" numOctaves="4" seed="19" result="noise" />
              <feColorMatrix in="noise" type="luminanceToAlpha" result="alpha" />
              <feComponentTransfer in="alpha" result="shaped">
                <feFuncA type="table" tableValues="0 0 .02 .14 .28 .08 0" />
              </feComponentTransfer>
              <feGaussianBlur in="shaped" stdDeviation="8" result="softNoise" />
              <feFlood floodColor="#8da198" floodOpacity=".62" result="smokeColor" />
              <feComposite in="smokeColor" in2="softNoise" operator="in" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#hero-smoke-back-filter)" />
        </svg>
        <svg className="hero-smoke hero-smoke-front" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="hero-smoke-front-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency=".014 .025" numOctaves="3" seed="7" result="noise" />
              <feDisplacementMap in="noise" in2="noise" scale="26" xChannelSelector="R" yChannelSelector="B" result="warped" />
              <feColorMatrix in="warped" type="luminanceToAlpha" result="alpha" />
              <feComponentTransfer in="alpha" result="shaped">
                <feFuncA type="table" tableValues="0 0 0 .1 .22 .06 0" />
              </feComponentTransfer>
              <feGaussianBlur in="shaped" stdDeviation="5" result="softNoise" />
              <feFlood floodColor="#64766d" floodOpacity=".55" result="smokeColor" />
              <feComposite in="smokeColor" in2="softNoise" operator="in" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#hero-smoke-front-filter)" />
        </svg>
        <div className="hero-fog" />
      </div>
      <div className="hero-vignette" aria-hidden="true" />
    </>
  );
}
