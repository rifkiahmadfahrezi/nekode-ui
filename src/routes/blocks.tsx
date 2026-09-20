import { createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { type BlockFile, BlockPreview } from "@/components/block-preview";
import { baseOptions } from "@/lib/layout.shared";
import { ContactForm } from "@/registry/blocks/contact-form";
import { ForgotPasswordForm } from "@/registry/blocks/forgot-password-form";
import { LoginForm } from "@/registry/blocks/login-form";
import { RegisterForm } from "@/registry/blocks/register-form";

export const Route = createFileRoute("/blocks")({
  component: BlocksPage,
});

function showValues(values: object) {
  toast("Form submitted!", {
    description: (
      <pre className="m-2 border p-1 font-mono">
        {JSON.stringify(values, null, 2)}
      </pre>
    ),
    closeButton: true,
  });
}

interface Block {
  name: string;
  title: string;
  description: string;
  files: BlockFile[];
  preview: ReactNode;
}

const file = (name: string): BlockFile => ({
  path: `src/registry/blocks/${name}.tsx`,
  target: `components/blocks/${name}.tsx`,
});

const blocks: Block[] = [
  {
    name: "login-form",
    title: "Login form",
    description: "Email and password sign-in with validation.",
    files: [file("login-form")],
    preview: (
      <LoginForm
        onSubmit={showValues}
        forgotPasswordHref="#"
        registerHref="#"
      />
    ),
  },
  {
    name: "register-form",
    title: "Register form",
    description: "Sign-up with name, email and password confirmation.",
    files: [file("register-form")],
    preview: <RegisterForm onSubmit={showValues} loginHref="#" />,
  },
  {
    name: "forgot-password-form",
    title: "Forgot password form",
    description: "Single-field form that requests a password reset link.",
    files: [file("forgot-password-form")],
    preview: <ForgotPasswordForm onSubmit={showValues} loginHref="#" />,
  },
  {
    name: "contact-form",
    title: "Contact form",
    description: "Name, email and a message with character count.",
    files: [file("contact-form")],
    preview: <ContactForm onSubmit={showValues} />,
  },
];

function BlocksPage() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
        <div>
          <h1 className="text-lg font-semibold">Blocks</h1>
          <p className="text-sm text-muted-foreground">
            Ready-to-use React blocks. Preview them at any screen size, read the
            source, then install with one command.
          </p>
        </div>

        {blocks.map(({ preview, ...block }) => (
          <BlockPreview key={block.name} {...block}>
            {preview}
          </BlockPreview>
        ))}
      </div>
    </HomeLayout>
  );
}
