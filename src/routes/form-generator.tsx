import { type AnyFieldApi, useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import {
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Eye,
  GripVertical,
  Search,
  Settings2,
  Trash2,
  X,
  XIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ComboboxField } from "@/components/ui/combobox-field";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { FileField } from "@/components/ui/file-field";
import { Label } from "@/components/ui/label";
import { NumberField } from "@/components/ui/number-field";
import { PasswordField } from "@/components/ui/password-field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { TextareaField } from "@/components/ui/textarea-field";
import { TimePickerField } from "@/components/ui/time-picker-field";
import { generateFormCode } from "@/lib/form-generator/codegen";
import { FIELD_KINDS, kindMeta } from "@/lib/form-generator/field-kinds";
import { buildFormSchema } from "@/lib/form-generator/schema";
import type {
  FieldConfig,
  FieldKind,
  FieldOption,
  StepConfig,
} from "@/lib/form-generator/types";
import { baseOptions } from "@/lib/layout.shared";
import { cn } from "@/lib/utils";

// Lazy load so shiki / fumadocs highlighter deps are only fetched when the Source tab opens.
const DynamicCodeBlock = React.lazy(() =>
  import("fumadocs-ui/components/dynamic-codeblock").then((mod) => ({
    default: mod.DynamicCodeBlock,
  })),
);

export const Route = createFileRoute("/form-generator")({
  component: RouteComponent,
});

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function makeField(kind: FieldKind, index: number): FieldConfig {
  return {
    id: uid(),
    kind,
    name: `${kind.replace(/-/g, "_")}_${index}`,
    label: FIELD_KINDS.find((k) => k.kind === kind)?.label ?? kind,
    required: true,
    options:
      kind === "select" || kind === "combobox"
        ? [
            { label: "Option 1", value: "option-1" },
            { label: "Option 2", value: "option-2" },
          ]
        : undefined,
  };
}

function makeStep(index: number): StepConfig {
  return { id: uid(), title: `Step ${index}`, fields: [] };
}

function RouteComponent() {
  const [steps, setSteps] = React.useState<StepConfig[]>([makeStep(1)]);
  const [activeStepId, setActiveStepId] = React.useState(steps[0].id);
  const [fieldCounter, setFieldCounter] = React.useState(1);
  const [view, setView] = React.useState<"preview" | "source">("preview");

  const activeStep = steps.find((s) => s.id === activeStepId) ?? steps[0];
  const code = React.useMemo(() => generateFormCode(steps), [steps]);

  function updateStep(
    stepId: string,
    updater: (step: StepConfig) => StepConfig,
  ) {
    setSteps((prev) => prev.map((s) => (s.id === stepId ? updater(s) : s)));
  }

  function addStep() {
    const step = makeStep(steps.length + 1);
    setSteps((prev) => [...prev, step]);
    setActiveStepId(step.id);
  }

  function removeStep(stepId: string) {
    setSteps((prev) => {
      const next = prev.filter((s) => s.id !== stepId);
      if (activeStepId === stepId) setActiveStepId(next[0].id);
      return next;
    });
  }

  function addField(kind: FieldKind) {
    const field = makeField(kind, fieldCounter);
    setFieldCounter((n) => n + 1);
    updateStep(activeStep.id, (s) => ({ ...s, fields: [...s.fields, field] }));
  }

  function updateField(fieldId: string, patch: Partial<FieldConfig>) {
    updateStep(activeStep.id, (s) => ({
      ...s,
      fields: s.fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)),
    }));
  }

  function removeField(fieldId: string) {
    updateStep(activeStep.id, (s) => ({
      ...s,
      fields: s.fields.filter((f) => f.id !== fieldId),
    }));
  }

  function moveField(fieldId: string, dir: -1 | 1) {
    updateStep(activeStep.id, (s) => {
      const i = s.fields.findIndex((f) => f.id === fieldId);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= s.fields.length) return s;
      const fields = [...s.fields];
      [fields[i], fields[j]] = [fields[j], fields[i]];
      return { ...s, fields };
    });
  }

  function reorderField(draggedId: string, targetId: string) {
    if (draggedId === targetId) return;
    updateStep(activeStep.id, (s) => {
      const from = s.fields.findIndex((f) => f.id === draggedId);
      const to = s.fields.findIndex((f) => f.id === targetId);
      if (from < 0 || to < 0) return s;
      const fields = [...s.fields];
      const [moved] = fields.splice(from, 1);
      fields.splice(to, 0, moved);
      return { ...s, fields };
    });
  }

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    toast.success("Copied source to clipboard");
  }

  return (
    <HomeLayout {...baseOptions()}>
      <div className="mx-auto flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-lg font-semibold">Form generator</h1>
          <p className="text-sm text-muted-foreground">
            Add fields from the sidebar, arrange them on the canvas, copy the
            generated component.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <FieldSidebar onAdd={addField} />

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StepTrack
                steps={steps}
                activeStepId={activeStepId}
                onSelect={setActiveStepId}
                onAdd={addStep}
                onRemove={removeStep}
              />
              <div className="flex items-center gap-2">
                <ViewToggle value={view} onChange={setView} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyCode}
                >
                  <Copy className="size-3.5" /> Copy source
                </Button>
              </div>
            </div>

            <div className="min-h-[520px] rounded-lg border bg-card p-6">
              {view === "preview" ? (
                <FormCanvas
                  steps={steps}
                  activeStepId={activeStepId}
                  onSelectStep={setActiveStepId}
                  onUpdateField={updateField}
                  onRemoveField={removeField}
                  onMoveField={moveField}
                  onReorderField={reorderField}
                />
              ) : (
                <React.Suspense
                  fallback={
                    <div className="flex h-[460px] items-center justify-center text-xs text-muted-foreground">
                      Loading source view...
                    </div>
                  }
                >
                  <DynamicCodeBlock lang="tsx" code={code} />
                </React.Suspense>
              )}
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

function ViewToggle({
  value,
  onChange,
}: {
  value: "preview" | "source";
  onChange: (v: "preview" | "source") => void;
}) {
  return (
    <div className="flex gap-1 rounded-md border bg-muted/40 p-1">
      <button
        type="button"
        onClick={() => onChange("preview")}
        className={cn(
          "flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
          value === "preview"
            ? "bg-background text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Eye className="size-3.5" /> Preview
      </button>
      <button
        type="button"
        onClick={() => onChange("source")}
        className={cn(
          "flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
          value === "source"
            ? "bg-background text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Code2 className="size-3.5" /> Source
      </button>
    </div>
  );
}

function FieldSidebar({ onAdd }: { onAdd: (kind: FieldKind) => void }) {
  const [query, setQuery] = React.useState("");
  const filtered = FIELD_KINDS.filter((meta) =>
    meta.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="flex w-full shrink-0 flex-col gap-3 lg:sticky lg:top-6 lg:w-64 lg:self-start">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search fields..."
          className={cn(
            "h-9 w-full rounded-md border bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            query && "pr-6",
          )}
        />
        {query && (
          <button type="button" onClick={() => setQuery("")}>
            <XIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4" />
          </button>
        )}
      </div>

      <div className="flex max-h-[70vh] flex-col gap-0.5 overflow-y-auto rounded-md border bg-card p-1.5">
        {filtered.map((meta) => (
          <button
            key={meta.kind}
            type="button"
            onClick={() => onAdd(meta.kind)}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
          >
            <meta.icon
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
            />
            {meta.label}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-2.5 py-6 text-center text-xs text-muted-foreground">
            No fields match "{query}".
          </p>
        )}
      </div>
    </div>
  );
}

function StepTrack({
  steps,
  activeStepId,
  onSelect,
  onAdd,
  onRemove,
}: {
  steps: StepConfig[];
  activeStepId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {steps.map((step, i) => {
        const active = step.id === activeStepId;
        return (
          <React.Fragment key={step.id}>
            {i > 0 && <div className="h-px w-4 shrink-0 bg-border" />}
            <button
              type="button"
              onClick={() => onSelect(step.id)}
              className={cn(
                "group flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full font-mono text-[10px]",
                  active
                    ? "bg-background text-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </span>
              {step.title}
              {active && steps.length > 1 && (
                <X
                  className="size-3 opacity-60 transition-opacity hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(step.id);
                  }}
                />
              )}
            </button>
          </React.Fragment>
        );
      })}
      <div className="h-px w-4 shrink-0 bg-border" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0 rounded-full text-muted-foreground"
        onClick={onAdd}
      >
        Add step
      </Button>
    </div>
  );
}

function FieldSettingsForm({
  field,
  meta,
  onChange,
}: {
  field: FieldConfig;
  meta: ReturnType<typeof kindMeta>;
  onChange: (patch: Partial<FieldConfig>) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <meta.icon className="size-3.5" strokeWidth={1.75} />
        {meta.label} settings
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Name"
          value={field.name}
          inputClassName="font-mono"
          onChange={(e) => onChange({ name: e.currentTarget.value })}
        />
        <TextField
          label="Label"
          value={field.label}
          onChange={(e) => onChange({ label: e.currentTarget.value })}
        />
      </div>

      <TextField
        label="Description"
        value={field.description ?? ""}
        onChange={(e) => onChange({ description: e.currentTarget.value })}
      />

      <TextField
        label="Placeholder"
        value={field.placeholder ?? ""}
        onChange={(e) => onChange({ placeholder: e.currentTarget.value })}
      />

      <div className="flex items-center gap-2">
        <Checkbox
          id={`${field.id}-required`}
          checked={field.required}
          onCheckedChange={(checked) =>
            onChange({ required: checked === true })
          }
        />
        <Label htmlFor={`${field.id}-required`}>Required</Label>
      </div>

      {meta.needsOptions && (
        <OptionsEditor
          options={field.options ?? []}
          onChange={(options) => onChange({ options })}
        />
      )}
    </div>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: FieldOption[];
  onChange: (options: FieldOption[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-dashed p-2">
      <span className="text-xs text-muted-foreground">Options</span>
      {options.map((opt, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: options have no stable id and are never reordered
        <div key={i} className="flex items-center gap-2">
          <TextField
            value={opt.label}
            placeholder="Label"
            onChange={(e) => {
              const next = [...options];
              next[i] = { ...next[i], label: e.currentTarget.value };
              onChange(next);
            }}
          />
          <TextField
            value={opt.value}
            placeholder="Value"
            onChange={(e) => {
              const next = [...options];
              next[i] = { ...next[i], value: e.currentTarget.value };
              onChange(next);
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(options.filter((_, j) => j !== i))}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([
            ...options,
            {
              label: `Option ${options.length + 1}`,
              value: `option-${options.length + 1}`,
            },
          ])
        }
      >
        + Option
      </Button>
    </div>
  );
}

function renderPreviewField(field: FieldConfig, formField: AnyFieldApi) {
  const common = {
    label: field.label,
    description: field.description || undefined,
    error: formField.state.meta.errors[0]?.message,
  };

  switch (field.kind) {
    case "textarea":
      return (
        <TextareaField
          {...common}
          placeholder={field.placeholder}
          value={formField.state.value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            formField.handleChange(e.currentTarget.value)
          }
          onBlur={formField.handleBlur}
        />
      );
    case "password":
      return (
        <PasswordField
          {...common}
          placeholder={field.placeholder}
          value={formField.state.value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            formField.handleChange(e.currentTarget.value)
          }
          onBlur={formField.handleBlur}
        />
      );
    case "number":
      return (
        <NumberField
          {...common}
          placeholder={field.placeholder}
          value={formField.state.value}
          onValueChange={formField.handleChange}
          onBlur={formField.handleBlur}
        />
      );
    case "select":
      return (
        <SelectField
          {...common}
          placeholder={field.placeholder}
          options={field.options ?? []}
          value={formField.state.value}
          onValueChange={formField.handleChange}
        />
      );
    case "combobox":
      return (
        <ComboboxField
          {...common}
          placeholder={field.placeholder}
          options={field.options ?? []}
          value={formField.state.value ?? ""}
          onValueChange={(v: string | undefined) =>
            formField.handleChange(v ?? "")
          }
        />
      );
    case "date-picker":
      return (
        <DatePickerField
          {...common}
          placeholder={field.placeholder}
          value={formField.state.value}
          onValueChange={formField.handleChange}
        />
      );
    case "time-picker":
      return (
        <TimePickerField
          {...common}
          value={formField.state.value}
          onValueChange={formField.handleChange}
        />
      );
    case "file":
      return (
        <FileField
          {...common}
          value={formField.state.value}
          onValueChange={formField.handleChange}
        />
      );
    default:
      return (
        <TextField
          {...common}
          placeholder={field.placeholder}
          value={formField.state.value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            formField.handleChange(e.currentTarget.value)
          }
          onBlur={formField.handleBlur}
        />
      );
  }
}

interface FormCanvasProps {
  steps: StepConfig[];
  activeStepId: string;
  onSelectStep: (id: string) => void;
  onUpdateField: (fieldId: string, patch: Partial<FieldConfig>) => void;
  onRemoveField: (fieldId: string) => void;
  onMoveField: (fieldId: string, dir: -1 | 1) => void;
  onReorderField: (draggedId: string, targetId: string) => void;
}

function FormCanvas(props: FormCanvasProps) {
  // Remount the form only when field identity/shape actually changes (name, kind,
  // required — what feeds zod schema + defaultValues), not on every keystroke or
  // reorder, so values typed into the canvas survive cosmetic edits.
  const shapeKey = React.useMemo(
    () =>
      props.steps
        .flatMap((s) => s.fields)
        .map((f) => `${f.name}:${f.kind}:${f.required}`)
        .sort()
        .join("|"),
    [props.steps],
  );
  return <FormCanvasInner key={shapeKey} {...props} />;
}

function FormCanvasInner({
  steps,
  activeStepId,
  onSelectStep,
  onUpdateField,
  onRemoveField,
  onMoveField,
  onReorderField,
}: FormCanvasProps) {
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);

  const { schema, defaultValues } = React.useMemo(
    () => buildFormSchema(steps),
    [steps],
  );

  const form = useForm({
    defaultValues,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      toast.success("Form submitted", {
        description: (
          <pre className="max-h-64 overflow-auto text-xs">
            {JSON.stringify(value, null, 2)}
          </pre>
        ),
      });
    },
  });

  const stepIndex = Math.max(
    0,
    steps.findIndex((s) => s.id === activeStepId),
  );
  const isMultiStep = steps.length > 1;
  const currentFields = steps[stepIndex].fields;

  const prevStepIndexRef = React.useRef(stepIndex);
  const [direction, setDirection] = React.useState(0);
  React.useEffect(() => {
    if (prevStepIndexRef.current !== stepIndex) {
      setDirection(stepIndex > prevStepIndexRef.current ? 1 : -1);
      prevStepIndexRef.current = stepIndex;
    }
  }, [stepIndex]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="grid gap-5"
    >
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={steps[stepIndex].id}
          custom={direction}
          initial={{ opacity: 0, x: direction * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -24 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="grid gap-5"
        >
          {currentFields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Add fields from the sidebar to build {steps[stepIndex].title}.
            </p>
          )}
          <AnimatePresence initial={false}>
            {currentFields.map((field, i) => (
              <form.Field key={field.id} name={field.name}>
                {(formField) => (
                  <FieldCanvasItem
                    field={field}
                    formField={formField}
                    index={i}
                    onChange={(patch) => onUpdateField(field.id, patch)}
                    onRemove={() => onRemoveField(field.id)}
                    onMoveUp={
                      i > 0 ? () => onMoveField(field.id, -1) : undefined
                    }
                    onMoveDown={
                      i < currentFields.length - 1
                        ? () => onMoveField(field.id, 1)
                        : undefined
                    }
                    draggingId={draggingId}
                    dragOverId={dragOverId}
                    setDraggingId={setDraggingId}
                    setDragOverId={setDragOverId}
                    onReorder={onReorderField}
                  />
                )}
              </form.Field>
            ))}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {isMultiStep ? (
        <div className="flex justify-between border-t pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={stepIndex === 0}
            onClick={() => onSelectStep(steps[stepIndex - 1].id)}
          >
            Back
          </Button>
          {stepIndex < steps.length - 1 ? (
            <Button
              type="button"
              onClick={() => onSelectStep(steps[stepIndex + 1].id)}
            >
              Next
            </Button>
          ) : (
            <form.Subscribe
              selector={(s) => [s.canSubmit, s.isSubmitting] as const}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              )}
            </form.Subscribe>
          )}
        </div>
      ) : (
        <form.Subscribe
          selector={(s) => [s.canSubmit, s.isSubmitting] as const}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              className="justify-self-start"
              disabled={!canSubmit}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          )}
        </form.Subscribe>
      )}
    </form>
  );
}

function FieldCanvasItem({
  field,
  formField,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  draggingId,
  dragOverId,
  setDraggingId,
  setDragOverId,
  onReorder,
}: {
  field: FieldConfig;
  formField: AnyFieldApi;
  index: number;
  onChange: (patch: Partial<FieldConfig>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  draggingId: string | null;
  dragOverId: string | null;
  setDraggingId: (id: string | null) => void;
  setDragOverId: (id: string | null) => void;
  onReorder: (draggedId: string, targetId: string) => void;
}) {
  const meta = kindMeta(field.kind);
  const isDragOver = dragOverId === field.id && draggingId !== field.id;

  return (
    <motion.div
      role="group"
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onDragOver={(e) => {
        if (!draggingId) return;
        e.preventDefault();
        setDragOverId(field.id);
      }}
      onDragLeave={() =>
        setDragOverId(dragOverId === field.id ? null : dragOverId)
      }
      onDrop={(e) => {
        e.preventDefault();
        if (draggingId) onReorder(draggingId, field.id);
        setDraggingId(null);
        setDragOverId(null);
      }}
      className={cn(
        "group/field relative rounded-md ring-offset-4 ring-offset-card transition-shadow",
        isDragOver && "ring-2 ring-ring",
      )}
    >
      <div className="absolute top-1 -left-6 hidden font-mono text-[10px] text-muted-foreground group-hover/field:block group-focus-within/field:block lg:block">
        {String(index + 1).padStart(2, "0")}
      </div>

      {renderPreviewField(field, formField)}

      <div className="absolute top-0 right-0 z-10 flex -translate-y-1/2 items-center gap-0.5 rounded-md border bg-popover p-0.5 opacity-0 shadow-sm transition-opacity group-hover/field:opacity-100 group-focus-within/field:opacity-100">
        <span
          role="button"
          tabIndex={-1}
          aria-label="Drag to reorder"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "move";
            setDraggingId(field.id);
          }}
          onDragEnd={() => {
            setDraggingId(null);
            setDragOverId(null);
          }}
          title="Drag to reorder"
          className="flex size-6 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-accent active:cursor-grabbing"
        >
          <GripVertical className="size-3.5" />
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={onMoveUp}
          disabled={!onMoveUp}
        >
          <ChevronUp className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={onMoveDown}
          disabled={!onMoveDown}
        >
          <ChevronDown className="size-3.5" />
        </Button>
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6"
              />
            }
          >
            <Settings2 className="size-3.5" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <FieldSettingsForm field={field} meta={meta} onChange={onChange} />
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
