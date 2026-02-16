export default function ExpiryInput({ expiry, setExpiry }) {
  return (
    <input
      type="datetime-local"
      value={expiry}
      onChange={(event) => setExpiry(event.target.value)}
      className="field-input"
    />
  );
}
