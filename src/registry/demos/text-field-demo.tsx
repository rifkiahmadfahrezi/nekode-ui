"use client"

import { TextField } from "@/registry/ui/text-field"

export function TextFieldDemo() {
  return (
    <TextField
      label="Email"
      placeholder="you@example.com"
      type="email"
      className="w-72"
    />
  )
}