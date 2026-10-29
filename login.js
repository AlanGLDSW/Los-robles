const { useState, useEffect } = React;

const LoginForm = () => {
  const [formData, setFormData] = useState({
    correo: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHuman, setIsHuman] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  useEffect(() => {
    const mainLogoUrl = "./los-robles-residencial.jpg";
    const appLogoUrl = "./robles-connect.jpg";

    const mainLogo = new Image();
    mainLogo.src = mainLogoUrl;
    mainLogo.onload = () => {
      const logoElement = document.getElementById("main-logo");
      if (logoElement) logoElement.src = mainLogoUrl;
    };
    mainLogo.onerror = () => {
      console.log("No se pudo cargar el logo principal");
    };

    const appLogo = new Image();
    appLogo.src = appLogoUrl;
    appLogo.onload = () => {
      const logoElement = document.getElementById("app-logo");
      if (logoElement) logoElement.src = appLogoUrl;
    };
    appLogo.onerror = () => {
      console.log("No se pudo cargar el logo de la app");
    };

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("message") === "verify_email") {
      setErrors({
        info: "Se ha enviado un correo de verificación. Puedes iniciar sesión ahora mismo.",
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.correo) {
      newErrors.correo = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = "El formato del correo no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    }

    if (!isHuman) {
      newErrors.captcha = "Debes verificar que no eres un robot";
    }

    if (!acceptedPolicy) {
      newErrors.policy = "Debes aceptar las políticas de privacidad";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const userData = JSON.parse(
        localStorage.getItem(`user_${formData.correo}`)
      );

      if (!userData) {
        setErrors({ submit: "Usuario no encontrado. Regístrate primero." });
        setIsSubmitting(false);
        return;
      }

      if (userData.password !== formData.password) {
        setErrors({ submit: "Contraseña incorrecta." });
        setIsSubmitting(false);
        return;
      }


      setTimeout(() => {
        

        localStorage.setItem("currentUser", JSON.stringify({ nombre: userData.nombre }));

        window.location.href = "homepage.html";
      }, 1000);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setErrors({ submit: "Error al iniciar sesión. Intenta nuevamente." });
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="correo">Correo electrónico:</label>
          <input
            type="email"
            id="correo"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            required
            placeholder="tucorreo@ejemplo.com"
          />
          {errors.correo && (
            <div className="error-message">{errors.correo}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Ingresa tu contraseña"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
          {errors.password && (
            <div className="error-message">{errors.password}</div>
          )}
        </div>

        <div className="form-group">
          <div className="captcha-container">
            <label>
              <input
                type="checkbox"
                checked={isHuman}
                onChange={() => setIsHuman(!isHuman)}
              />
              No soy un robot
            </label>
          </div>
          {errors.captcha && (
            <div className="error-message">{errors.captcha}</div>
          )}
        </div>

        <div className="form-group">
          <div className="policy-container">
            <label>
              <input
                type="checkbox"
                checked={acceptedPolicy}
                onChange={() => setAcceptedPolicy(!acceptedPolicy)}
              />
              Acepto las{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert(
                    "Políticas de privacidad: [Aquí va el documento de las políticas de privacidad del residencial]"
                  );
                }}
              >
                "Políticas de privacidad"
              </a>
            </label>
          </div>
          {errors.policy && (
            <div className="error-message">{errors.policy}</div>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        {errors.info && <div className="info-message">{errors.info}</div>}
      </form>

      <div className="login-links">
        <p>
          ¿No tienes cuenta? <a href="index.html">Regístrate aquí</a>
        </p>
        <p>
          <a href="olvide.html">¿Olvidaste tu contraseña?</a>
        </p>
      </div>
    </div>
  );
};

ReactDOM.render(
  React.createElement(LoginForm),
  document.getElementById("login-root")
);

