import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Satori rasterises this outside the DOM: CSS custom properties do not exist
// here, so the mark cannot follow --ink / --green / a theme preset the way
// shared/components/brand-mark.tsx does. The two literals below are the
// deliberate frozen values — brand green ground, canvas-light mark — and iOS
// composites apple-touch-icons on an opaque tile anyway, so a transparent
// currentColor mark would render as a black square on a home screen.
const GROUND = "#176b43";
const MARK = "#f4f7f3";

// Same two subpaths as app/icon.svg; the colour is inlined because an <img>
// data URI has no inheritable colour context.
const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="112" height="112"><path fill="${MARK}" fill-rule="evenodd" d="M8.6 8.6A7.4 7.4 0 0 1 23.4 8.6A7.4 7.4 0 0 1 23.4 23.4A7.4 7.4 0 0 1 8.6 23.4A7.4 7.4 0 0 1 8.6 8.6ZM16 6.2Q17.6 14.4 25.8 16Q17.6 17.6 16 25.8Q14.4 17.6 6.2 16Q14.4 14.4 16 6.2Z"/></svg>`;

export default function AppleIcon() {
  const src = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: GROUND,
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" height={112} src={src} width={112} />
    </div>,
    size,
  );
}
