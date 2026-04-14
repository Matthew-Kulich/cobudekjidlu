export function AuthPanel({
  currentUser,
  authMode,
  authForm,
  error,
  status,
  onModeChange,
  onAuthFormChange,
  onSubmit,
  onLogout
}) {
  return (
    <div className="hero-panel auth-panel">
      <span className="status-pill">cobudekjidlu</span>
      <p>{status}</p>
      {error ? <p className="error-text">{error}</p> : null}

      {currentUser ? (
        <div className="user-box">
          <strong>{currentUser.displayName}</strong>
          <span>{currentUser.email}</span>
          <button className="ghost-button" type="button" onClick={onLogout}>
            Odhlasit se
          </button>
        </div>
      ) : (
        <>
          <div className="auth-switch">
            <button
              className={authMode === "login" ? "chip active" : "chip"}
              type="button"
              onClick={() => onModeChange("login")}
            >
              Prihlaseni
            </button>
            <button
              className={authMode === "register" ? "chip active" : "chip"}
              type="button"
              onClick={() => onModeChange("register")}
            >
              Registrace
            </button>
          </div>

          <form className="recipe-form" onSubmit={onSubmit}>
            {authMode === "register" ? (
              <label>
                Jmeno
                <input
                  value={authForm.displayName}
                  onChange={(event) => onAuthFormChange("displayName", event.target.value)}
                  required
                />
              </label>
            ) : null}

            <label>
              Email
              <input
                type="email"
                value={authForm.email}
                onChange={(event) => onAuthFormChange("email", event.target.value)}
                required
              />
            </label>

            <label>
              Heslo
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => onAuthFormChange("password", event.target.value)}
                required
              />
            </label>

            <button className="primary-button" type="submit">
              {authMode === "login" ? "Prihlasit se" : "Vytvorit ucet"}
            </button>
          </form>

          <p className="demo-note">Demo ucet: matej@cobudekjidlu.local / demo123</p>
        </>
      )}
    </div>
  );
}
