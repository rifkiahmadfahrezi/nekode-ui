"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TimePickerField } from "@/registry/ui/time-picker-field";

type Orientation = "vertical" | "horizontal" | "responsive";
type TimeFormat = "24h" | "12h";

const orientations: Orientation[] = ["vertical", "horizontal", "responsive"];
const formats: TimeFormat[] = ["24h", "12h"];

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

function ControlField({
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

export function TimePickerFieldPlaygroundDemo() {
  const [orientation, setOrientation] = React.useState<Orientation>("vertical");
  const [timeFormat, setTimeFormat] = React.useState<TimeFormat>("24h");
  const [label, setLabel] = React.useState("Meeting time");
  const [description, setDescription] = React.useState(
    "Select a time for the meeting.",
  );
  const [error, setError] = React.useState("");
  const [required, setRequired] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);

  const inputStyle =
    "w-full rounded-md border border-fd-border bg-fd-background px-3 py-1.5 text-sm text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-fd-border md:flex-row">
      <div className="flex min-h-[320px] flex-1 items-center justify-center p-10">
        <TimePickerField
          label={label || undefined}
          description={!error ? description || undefined : undefined}
          error={error || undefined}
          required={required}
          disabled={disabled}
          orientation={orientation}
          timeFormat={timeFormat}
          inputClassName="w-72"
        />
      </div>

      <div className="w-full shrink-0 space-y-5 border-t border-fd-border bg-fd-muted/20 p-5 md:w-72 md:border-l md:border-t-0">
        <ControlField label="Orientation">
          <SegmentedControl
            value={orientation}
            onChange={setOrientation}
            options={orientations}
          />
        </ControlField>

        <ControlField label="Time format">
          <SegmentedControl
            value={timeFormat}
            onChange={setTimeFormat}
            options={formats}
          />
        </ControlField>

        <ControlField label="Label">
          <input
            className={inputStyle}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </ControlField>

        <Toggle
          checked={required}
          onChange={setRequired}
          label="With asterisk"
        />
        <Toggle checked={disabled} onChange={setDisabled} label="Disabled" />

        <ControlField label="Description">
          <input
            className={inputStyle}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Field description"
          />
        </ControlField>

        <ControlField label="Error">
          <input
            className={inputStyle}
            value={error}
            onChange={(e) => setError(e.target.value)}
            placeholder="Enter prop value"
          />
        </ControlField>
      </div>
    </div>
  );
}
