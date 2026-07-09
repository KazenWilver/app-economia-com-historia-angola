import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <ForgotPasswordForm loginHref="/login" redirectAfterReset="/login" />
    </div>
  );
}
