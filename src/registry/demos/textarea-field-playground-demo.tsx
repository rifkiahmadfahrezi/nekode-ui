"use client";

import * as React from "react";
import { TextareaField } from "@/components/ui/textarea-field";
import { cn } from "@/lib/utils";

type Orientation = "vertical" | "horizontal" | "responsive";

const orientations: Orientation[] = ["vertical", "horizontal", "responsive"];

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: T[];
}) {
  return (
    <div className="inline-flex rounded-md bg-fd-muted p-0.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-[5px] px-3 py-1.5 text-sm capitalize transition-colors",
            value === option
              ? "bg-fd-background text-fd-foreground shadow-sm"
              : "text-fd-muted-foreground hover:text-fd-foreground",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-blue-500" : "bg-fd-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
            checked && "translate-x-4",
          )}
        />
      </button>
      <span className="text-sm text-fd-foreground">{label}</span>
    </label>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-fd-foreground">{label}</p>
      {children}
    </div>
  );
}

export function TextareaFieldPlaygroundDemo() {
  const [orientation, setOrientation] = React.useState<Orientation>("vertical");
  const [label, setLabel] = React.useState("Bio");
  const [description, setDescription] = React.useState(
    "Tell us a little about yourself.",
  );
  const [error, setError] = React.useState("");
  const [required, setRequired] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
  const [showCount, setShowCount] = React.useState(true);
  const [maxLength, setMaxLength] = React.useState("200");
  const [autoResize, setAutoResize] = React.useState(false);
  const [maxRows, setMaxRows] = React.useState("6");
  const [rows, setRows] = React.useState("3");

  const inputStyle =
    "w-full rounded-md border border-fd-border bg-fd-background px-3 py-1.5 text-sm text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-fd-border md:flex-row">
      <div className="flex min-h-[320px] flex-1 items-center justify-center p-10">
        <TextareaField
          label={label || undefined}
          description={!error ? description || undefined : undefined}
          error={error || undefined}
          required={required}
          disabled={disabled}
          orientation={orientation}
          showCount={showCount}
          maxLength={maxLength ? Number(maxLength) : undefined}
          autoResize={autoResize}
          maxRows={autoResize && maxRows ? Number(maxRows) : undefined}
          rows={Number(rows) || 3}
          placeholder="I'm a frontend developer based in..."
          className="w-80"
        />
      </div>

      <div className="w-full shrink-0 space-y-5 border-t border-fd-border bg-fd-muted/20 p-5 md:w-72 md:border-l md:border-t-0">
        <Field label="Orientation">
          <SegmentedControl
            value={orientation}
            onChange={setOrientation}
            options={orientations}
          />
        </Field>

        <Field label="Label">
          <input
            className={inputStyle}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </Field>

        <Toggle
          checked={required}
          onChange={setRequired}
          label="With asterisk"
        />
        <Toggle checked={disabled} onChange={setDisabled} label="Disabled" />
        <Toggle
          checked={showCount}
          onChange={setShowCount}
          label="Show count"
        />

        {showCount && (
          <Field label="Max length">
            <input
              className={inputStyle}
              value={maxLength}
              onChange={(e) => setMaxLength(e.target.value)}
              placeholder="none"
              inputMode="numeric"
            />
          </Field>
        )}

        <Toggle
          checked={autoResize}
          onChange={setAutoResize}
          label="Auto resize"
        />

        {autoResize && (
          <Field label="Max rows">
            <input
              className={inputStyle}
              value={maxRows}
              onChange={(e) => setMaxRows(e.target.value)}
              placeholder="none"
              inputMode="numeric"
            />
          </Field>
        )}

        <Field label="Rows">
          <input
            className={inputStyle}
            value={rows}
            onChange={(e) => setRows(e.target.value)}
            inputMode="numeric"
          />
        </Field>

        <Field label="Description">
          <input
            className={inputStyle}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Input description"
          />
        </Field>

        <Field label="Error">
          <input
            className={inputStyle}
            value={error}
            onChange={(e) => setError(e.target.value)}
            placeholder="Enter prop value"
          />
        </Field>
      </div>
    </div>
  );
}
