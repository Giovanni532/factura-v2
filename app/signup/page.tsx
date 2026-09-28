import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/forms/signup-form";

export default function SignupPage() {
    return (
        <AuthShell variant="signup">
            <SignupForm />
        </AuthShell>
    );
}
