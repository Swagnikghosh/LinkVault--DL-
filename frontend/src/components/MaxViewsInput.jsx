export default function MaxViewsInput({ maxViews, setMaxViews }) {
  return (
    <input
      type="number"
      min="1"
      value={maxViews}
      onChange={(event) => setMaxViews(event.target.value)}
      placeholder="Example: 5"
      className="field-input"
    />
  );
}
