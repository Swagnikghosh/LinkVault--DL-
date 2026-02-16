export default function PasswordInput({ password, setPassword }) {
  return (
    <input
      type="password"
      value={password}
      onChange={(event) => setPassword(event.target.value)}
      placeholder="Protect with a password"
      className="field-input"
    />
  );
}
