// PasswordStrength.jsx
// Shows a visual bar (Weak → Fair → Good → Strong) below the
// password field during registration.
//
// Why separate?
// It has its own logic (scoring) and its own markup. Keeping it
// isolated means you can test it, tweak it, or reuse it anywhere
// without touching the RegisterPage.
//
// Props:
//   password - the current password string to score

export default function PasswordStrength({ password }) {
  // Score: one point for each rule passed.
  // We check 4 rules, so score is 0–4.
  const score = [
    password.length >= 8,           // at least 8 chars
    /[A-Z]/.test(password),         // has uppercase
    /[0-9]/.test(password),         // has a number
    /[^A-Za-z0-9]/.test(password),  // has a special character
  ].filter(Boolean).length

  // Maps score → CSS class and human-readable label
  const cls    = ['', 'strength-weak', 'strength-fair', 'strength-good', 'strength-strong']
  const labels = ['', 'Weak',          'Fair',          'Good',          'Strong']

  return (
    <div
      className="strength-bar-wrap"
      // Screen readers announce "Password strength: Good" etc.
      aria-label={`Password strength: ${labels[score]}`}
    >
      <div className="strength-bars">
        {/* Render 4 segments; segments up to `score` get a colour class */}
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`strength-seg ${i <= score ? cls[score] : ''}`}
          />
        ))}
      </div>
      {score > 0 && (
        <span className={`strength-label ${cls[score]}`}>
          {labels[score]}
        </span>
      )}
    </div>
  )
}
