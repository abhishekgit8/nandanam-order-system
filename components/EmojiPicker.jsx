'use client';

const FOOD_EMOJIS = [
  '🍛', '🥘', '🍚', '🍳', '🍲', '🍜', '🥟', '🍣',
  '🍖', '🍗', '🥩', '🥓', '🍤', '🐟', '🦐', '🦑',
  '🥬', '🥦', '🥗', '🫘', '🥜', '🍞', '🫓', '🥖',
  '🥞', '🧇', '☕', '🍵', '🥤', '🧃', '🥛', '🍺',
  '🫕', '🍝', '🌮', '🌯', '🥙', '🧆', '🥚', '🧀',
  '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒',
  '🧅', '🧄', '🍋', '🍯', '🧊', '🍰', '🎂', '🍮',
  '🥤', '🧋', '🫖', '🍵', '☕', '🥛', '🍺', '🍷',
];

export default function EmojiPicker({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-8 gap-1 p-2 bg-white border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
      {FOOD_EMOJIS.map((emoji, i) => (
        <button
          key={`${emoji}-${i}`}
          type="button"
          onClick={() => onSelect(emoji)}
          className={`text-xl p-1 rounded hover:bg-gray-100 transition ${
            selected === emoji ? 'bg-kerala-gold/30 ring-1 ring-kerala-gold' : ''
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
