import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function AdminForgotPasswordPage() {
  return (
    <ForgotPasswordForm
      variant="admin"
      loginHref="/admin/login"
      redirectAfterReset="/admin/login"
    />
  );
}
