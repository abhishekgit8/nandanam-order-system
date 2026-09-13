'use client';

export default function VegIndicator({ veg, size = 11 }) {
  const color = veg ? '#1F9254' : '#B00911';
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0"
      style={{ width: size + 2, height: size + 2, border: `1.5px solid ${color}`, borderRadius: 2 }}
    >
      <span
        style={{
          width: size * 0.45,
          height: size * 0.45,
          borderRadius: '50%',
          background: color,
        }}
      />
    </span>
  );
}
