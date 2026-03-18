"use client";

interface TimeWindowSliderProps {
  startHour: number;
  endHour: number;
  onChange: (startHour: number, endHour: number) => void;
}

const MIN_GAP = 2;
const MIN_HOUR = 0;
const MAX_HOUR = 24;

function formatHourLabel(hour: number) {
  const normalizedHour = hour % 24;
  const suffix = normalizedHour >= 12 ? "PM" : "AM";
  const twelveHour = normalizedHour % 12 || 12;
  return `${twelveHour} ${suffix}`;
}

export function TimeWindowSlider({
  startHour,
  endHour,
  onChange,
}: TimeWindowSliderProps) {
  const startPercent = (startHour / MAX_HOUR) * 100;
  const endPercent = (endHour / MAX_HOUR) * 100;

  return (
    <div className="min-w-[260px] max-w-sm">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>{formatHourLabel(startHour)}</span>
        <span>{formatHourLabel(endHour)}</span>
      </div>

      <div className="relative h-8">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-gray-200" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-blue-500"
          style={{
            left: `${startPercent}%`,
            width: `${Math.max(0, endPercent - startPercent)}%`,
          }}
        />

        <input
          type="range"
          min={MIN_HOUR}
          max={MAX_HOUR - MIN_GAP}
          step={1}
          value={startHour}
          onChange={(event) => {
            const nextStart = Math.min(
              Number(event.target.value),
              endHour - MIN_GAP
            );
            onChange(nextStart, endHour);
          }}
          aria-label="Visible start hour"
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:shadow"
        />

        <input
          type="range"
          min={MIN_HOUR + MIN_GAP}
          max={MAX_HOUR}
          step={1}
          value={endHour}
          onChange={(event) => {
            const nextEnd = Math.max(
              Number(event.target.value),
              startHour + MIN_GAP
            );
            onChange(startHour, nextEnd);
          }}
          aria-label="Visible end hour"
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:shadow"
        />
      </div>
    </div>
  );
}
