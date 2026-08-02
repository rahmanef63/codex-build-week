// The Asisten Pribadi AI mark, inlined so it inherits `color` from whatever
// renders it — the mark follows the active theme preset instead of shipping a
// baked hex. Geometry is documented in app/icon.svg (same two subpaths):
// a four-petal rosette built from four exact semicircles on the sides of an
// inscribed square, with a four-point sparkle knocked out via fill-rule.
//
// Decorative by default (aria-hidden), because every current consumer pairs it
// with a text wordmark or an aria-label on the surrounding link. Pass `title`
// only when the mark is the sole accessible content of its container.

const OUTER =
  "M8.6 8.6A7.4 7.4 0 0 1 23.4 8.6A7.4 7.4 0 0 1 23.4 23.4A7.4 7.4 0 0 1 8.6 23.4A7.4 7.4 0 0 1 8.6 8.6Z";
const SPARKLE = "M16 6.2Q17.6 14.4 25.8 16Q17.6 17.6 16 25.8Q14.4 17.6 6.2 16Q14.4 14.4 16 6.2Z";

export function BrandMark({
  className,
  size = 28,
  title,
}: {
  className?: string;
  size?: number;
  title?: string;
}) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      className={className}
      focusable="false"
      height={size}
      role={title ? "img" : undefined}
      viewBox="0 0 32 32"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <path d={`${OUTER}${SPARKLE}`} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

export default BrandMark;
