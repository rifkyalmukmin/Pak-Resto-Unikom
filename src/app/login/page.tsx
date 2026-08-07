import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center font-sans text-stone-500"
          style={{ backgroundColor: "#FAF9F6" }}
        >
          Memuat...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
