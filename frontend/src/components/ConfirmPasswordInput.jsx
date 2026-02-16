export default function ConfirmPasswordInput({ confirmPassword, setConfirmPassword }) {
  return (
    <input
      type="password"
      value={confirmPassword}
      onChange={(event) => setConfirmPassword(event.target.value)}
      placeholder="Confirm password"
      className="field-input"
    />
  );
}
