"use client";

import * as React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface ColorPickerFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "type"
  > {
  label?: string;
  description?: string;
  error?: string;
  /** Hex color, e.g. `"#3b82f6"`. Empty string means no color. */
  value?: string;
  defaultValue?: string;
  /** Called with a lowercase `#rrggbb` string (or `""` when cleared). */
  onValueChange?: (value: string) => void;
  /** Swatches shown under the picker. Pass `[]` to hide them. */
  presets?: string[];
  /** Passed to the underlying `Field` wrapper. */
  fieldClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
}

export const DEFAULT_COLOR_PRESETS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#64748b",
  "#0f172a",
  "#ffffff",
];

interface Hsv {
  h: number;
  s: number;
  v: number;
}

/** Accepts `#rgb`, `#rrggbb` (with or without `#`). Returns `#rrggbb` or `null`. */
export function normalizeHex(input: string): string | null {
  const raw = input.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/.test(raw)) {
    return `#${raw
      .split("")
      .map((c) => c + c)
      .join("")}`;
  }
  if (/^[0-9a-f]{6}$/.test(raw)) return `#${raw}`;
  return null;
}

function hexToHsv(hex: string): Hsv {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

function hsvToHex({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    const c = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(5)}${f(3)}${f(1)}`;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Pointer-drag helper: calls `onMove` with 0..1 coordinates inside `el`. */
function usePointerDrag(onMove: (x: number, y: number) => void) {
  const ref = React.useRef<HTMLDivElement>(null);
  const move = (event: React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    onMove(
      clamp01((event.clientX - rect.left) / rect.width),
      clamp01((event.clientY - rect.top) / rect.height),
    );
  };
  return {
    ref,
    onPointerDown: (event: React.PointerEvent) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      move(event);
    },
    onPointerMove: (event: React.PointerEvent) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event);
    },
  };
}

function ColorPanel({
  hsv,
  onChange,
  presets,
  current,
}: {
  hsv: Hsv;
  onChange: (next: Hsv) => void;
  presets: string[];
  current: string;
}) {
  const area = usePointerDrag((x, y) => onChange({ ...hsv, s: x, v: 1 - y }));
  const hue = usePointerDrag((x) => onChange({ ...hsv, h: x * 360 }));

  const areaKeys = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 0.1 : 0.01;
    const next = { ...hsv };
    if (event.key === "ArrowLeft") next.s = clamp01(hsv.s - step);
    else if (event.key === "ArrowRight") next.s = clamp01(hsv.s + step);
    else if (event.key === "ArrowUp") next.v = clamp01(hsv.v + step);
    else if (event.key === "ArrowDown") next.v = clamp01(hsv.v - step);
    else return;
    event.preventDefault();
    onChange(next);
  };

  const hueKeys = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 1;
    let h = hsv.h;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") h -= step;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") h += step;
    else if (event.key === "Home") h = 0;
    else if (event.key === "End") h = 360;
    else return;
    event.preventDefault();
    onChange({ ...hsv, h: Math.min(360, Math.max(0, h)) });
  };

  return (
    <div className="grid gap-3">
      <div
        {...area}
        role="slider"
        tabIndex={0}
        aria-label="Saturation and brightness"
        aria-valuetext={`Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
        aria-valuenow={Math.round(hsv.s * 100)}
        onKeyDown={areaKeys}
        className="relative h-36 w-full cursor-crosshair touch-none rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        style={{
          backgroundColor: `hsl(${hsv.h} 100% 50%)`,
          backgroundImage:
            "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.3)]"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            backgroundColor: current,
          }}
        />
      </div>

      <div
        {...hue}
        role="slider"
        tabIndex={0}
        aria-label="Hue"
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(hsv.h)}
        onKeyDown={hueKeys}
        className="relative h-3 w-full cursor-pointer touch-none rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        style={{
          backgroundImage:
            "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.3)]"
          style={{
            left: `${(hsv.h / 360) * 100}%`,
            backgroundColor: `hsl(${hsv.h} 100% 50%)`,
          }}
        />
      </div>

      {presets.length > 0 && (
        <div className="grid grid-cols-6 gap-1.5">
          {presets.map((preset) => {
            const hex = normalizeHex(preset) ?? preset;
            return (
              <button
                key={preset}
                type="button"
                aria-label={`Use ${hex}`}
                aria-pressed={hex === current}
                onClick={() => onChange(hexToHsv(hex))}
                className={cn(
                  "aspect-square w-full rounded-md border border-foreground/10 outline-none transition-transform hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50",
                  hex === current &&
                    "ring-2 ring-ring ring-offset-2 ring-offset-popover",
                )}
                style={{ backgroundColor: hex }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export const ColorPickerField = React.forwardRef<
  HTMLInputElement,
  ColorPickerFieldProps
>(
  (
    {
      label,
      description,
      error,
      value,
      defaultValue = "",
      onValueChange,
      presets = DEFAULT_COLOR_PRESETS,
      fieldClassName,
      labelClassName,
      inputClassName,
      orientation = "vertical",
      className,
      id,
      disabled,
      required,
      placeholder = "#000000",
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const [internal, setInternal] = React.useState(defaultValue);
    const color = normalizeHex(value ?? internal) ?? "";

    // The text box keeps its own draft so partial input like "#3b8" isn't
    // clobbered while typing; it is resynced when the color changes elsewhere.
    const [draft, setDraft] = React.useState(color);
    React.useEffect(() => setDraft(color), [color]);

    // HSV lives in state so the hue survives picking pure grays/black.
    const [hsv, setHsv] = React.useState<Hsv>(() =>
      color ? hexToHsv(color) : { h: 0, s: 0, v: 0 },
    );
    React.useEffect(() => {
      setHsv((prev) =>
        color && color !== hsvToHex(prev) ? hexToHsv(color) : prev,
      );
    }, [color]);

    const commit = (next: string) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };

    const handlePanelChange = (next: Hsv) => {
      setHsv(next);
      commit(hsvToHex(next));
    };

    return (
      <Field
        orientation={orientation}
        data-invalid={error ? true : undefined}
        className={fieldClassName}
      >
        {label && (
          <FieldLabel
            htmlFor={inputId}
            className={cn(
              error && "text-destructive",
              disabled && "opacity-70 cursor-not-allowed",
              labelClassName,
            )}
          >
            {label}
            {required && (
              <>
                <span aria-hidden="true" className="text-destructive ml-0.5">
                  *
                </span>
                <span className="sr-only"> (required)</span>
              </>
            )}
          </FieldLabel>
        )}

        <div className={cn("relative flex items-center", className)}>
          <Popover>
            <PopoverTrigger
              type="button"
              disabled={disabled}
              aria-label={color ? `Pick color, current ${color}` : "Pick color"}
              className="absolute left-1.5 z-10 size-6 rounded-sm border border-foreground/15 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: color || "transparent",
                backgroundImage: color
                  ? undefined
                  : "linear-gradient(45deg, transparent 45%, var(--color-destructive) 45%, var(--color-destructive) 55%, transparent 55%)",
              }}
            />
            <PopoverContent align="start" className="w-64 p-3">
              <ColorPanel
                hsv={hsv}
                onChange={handlePanelChange}
                presets={presets}
                current={color}
              />
            </PopoverContent>
          </Popover>

          <Input
            id={inputId}
            ref={ref}
            type="text"
            spellCheck={false}
            autoComplete="off"
            maxLength={7}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            aria-required={required || undefined}
            aria-invalid={!!error}
            aria-describedby={descriptionId}
            aria-errormessage={errorId}
            value={draft}
            onChange={(event) => {
              const next = event.currentTarget.value;
              setDraft(next);
              const hex = normalizeHex(next);
              if (hex && next.replace(/^#/, "").length === 6) commit(hex);
              else if (next.trim() === "") commit("");
            }}
            onBlur={(event) => {
              const hex = normalizeHex(draft);
              if (hex) {
                if (hex !== color) commit(hex);
                setDraft(hex);
              } else if (draft.trim() !== "") {
                setDraft(color);
              }
              onBlur?.(event);
            }}
            className={cn("pl-10 font-mono uppercase", inputClassName)}
            {...props}
          />
        </div>

        {description && !error && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {error && <FieldError id={errorId}>{error}</FieldError>}
      </Field>
    );
  },
);

ColorPickerField.displayName = "ColorPickerField";
