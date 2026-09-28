import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
    return (
        <AuthShell variant="login">
            <LoginForm />
        </AuthShell>
    );
}
