import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Wedding invitation of J. Joseph Sanjay & B. Fathima Rani, 13 September 2026';

/**
 * The card guests see when the link is shared on WhatsApp, which is how this
 * invitation will mostly travel.
 *
 * Rendered by Satori, which supports only a subset of CSS: flexbox only (no
 * grid), and every element with more than one child needs an explicit
 * `display: flex`. No font files are loaded, so this stays self-contained and
 * cannot fail at build time on a missing asset.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#050B14',
          backgroundImage:
            'radial-gradient(circle at 50% 40%, #15325B 0%, #0D1F3D 45%, #050B14 100%)',
          color: '#F5E6C4',
          position: 'relative',
        }}
      >
        {/* Double gold rule framing the card */}
        <div
          style={{
            position: 'absolute',
            top: 28,
            left: 28,
            right: 28,
            bottom: 28,
            border: '2px solid rgba(212,175,55,0.55)',
            borderRadius: 8,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 40,
            right: 40,
            bottom: 40,
            border: '1px solid rgba(212,175,55,0.28)',
            borderRadius: 4,
            display: 'flex',
          }}
        />

        <div
          style={{
            fontSize: 22,
            letterSpacing: 12,
            textTransform: 'uppercase',
            color: '#D4AF37',
            marginBottom: 28,
          }}
        >
          Save the Date
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: 62,
            fontWeight: 700,
            color: '#F5E6C4',
            lineHeight: 1.18,
          }}
        >
          <div style={{ display: 'flex' }}>J. Joseph Sanjay</div>
          <div style={{ display: 'flex', fontSize: 34, color: '#D4AF37', margin: '10px 0' }}>
            weds
          </div>
          <div style={{ display: 'flex' }}>B. Fathima Rani</div>
        </div>

        {/* Flourish */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '38px 0 26px' }}>
          <div style={{ width: 150, height: 1, backgroundColor: 'rgba(212,175,55,0.5)' }} />
          {/* A rotated square rather than a glyph: any character outside the
              default font makes Satori fetch a font at build time, which fails
              in a sandboxed CI environment. */}
          <div
            style={{
              width: 12,
              height: 12,
              backgroundColor: '#D4AF37',
              transform: 'rotate(45deg)',
              margin: '0 20px',
              display: 'flex',
            }}
          />
          <div style={{ width: 150, height: 1, backgroundColor: 'rgba(212,175,55,0.5)' }} />
        </div>

        <div style={{ fontSize: 34, letterSpacing: 6, color: '#FDFBF7' }}>
          13 . 09 . 2026
        </div>

        <div
          style={{
            fontSize: 21,
            letterSpacing: 4,
            color: 'rgba(245,230,196,0.72)',
            marginTop: 16,
            textTransform: 'uppercase',
          }}
        >
          St. Fathima Shrine, Krishnagiri
        </div>
      </div>
    ),
    size,
  );
}
