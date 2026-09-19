import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoginForm from "../../components/auth/LoginForm";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError("");

    const result = await login(email, password);

    setLoading(false);

    if (!result.success) {
      setError(result.message || "Invalid email or password.");
      return;
    }

    const role = result.user?.role?.toLowerCase();

    if (role === "admin" || role === "hr") {
      navigate("/admin/dashboard");
    } else if (role === "candidate") {
      navigate("/candidate/dashboard");
    } else {
      setError("User role is not configured correctly.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>AI Interview System</h1>
          <p>Sign in to continue</p>
        </div>

        <LoginForm
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}

export default Login;