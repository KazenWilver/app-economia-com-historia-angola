import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <ResetPasswordForm
        defaultLoginHref="/login"
        forgotPasswordHref="/recuperar-palavra-passe"
      />
    </div>
  );
}
