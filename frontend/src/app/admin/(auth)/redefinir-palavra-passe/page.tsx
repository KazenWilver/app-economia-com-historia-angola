import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function AdminResetPasswordPage() {
  return (
    <ResetPasswordForm variant="admin" defaultLoginHref="/admin/login" />
  );
}
