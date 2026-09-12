interface StarProps {
  fill: number;
}

function Star({ fill }: StarProps) {
  // fill: 0 - 1
  const id = useId_polyfill();
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="var(--color-accent)" />
          <stop offset={`${fill * 100}%`} stopColor="#DAD5C6" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6L10 1.5z"
      />
    </svg>
  );
}

let counter = 0;
function useId_polyfill(): string {
  // Evita depender de React 18's useId sólo para mantener el componente simple
  counter += 1;
  return `star-grad-${counter}-${Math.random().toString(36).slice(2, 7)}`;
}

type StarRatingSize = "sm" | "md" | "lg";

interface StarRatingProps {
  value?: number;
  reviews?: number;
  size?: StarRatingSize;
}

export default function StarRating({ value = 0, reviews, size = "sm" }: StarRatingProps) {
  const stars = [0, 1, 2, 3, 4].map((i) => {
    const fill = Math.max(0, Math.min(1, value - i));
    return <Star key={i} fill={fill} />;
  });
  return (
    <div className={`star-rating star-rating-${size}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ display: "inline-flex", gap: 1 }}>{stars}</span>
      {typeof reviews === "number" && (
        <span style={{ fontSize: 12.5, color: "var(--color-teal)", fontWeight: 600 }}>
          {reviews.toLocaleString("es-PE")}
        </span>
      )}
    </div>
  );
}
