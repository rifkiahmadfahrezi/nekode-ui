import { Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { StatusPage } from "@/components/status-page";

export function NotFound() {
  return (
    <StatusPage
      code="404"
      eyebrow="Page not found"
      title={
        <>
          This page wandered off{" "}
          <span className="serif block">like a cat.</span>
        </>
      }
      description="The link may be broken, or the page was moved or renamed. Try the docs, or head back home."
      actions={
        <>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft className="size-5" />
            Back home
          </Link>
          <Link
            to="/docs/$"
            params={{ _splat: "" }}
            className="btn btn-outline"
          >
            <BookOpen className="size-5" />
            Browse docs
          </Link>
        </>
      }
    />
  );
}
