export default function TextUpload({ text, setText }) {
  return (
    <textarea
      value={text}
      onChange={(event) => setText(event.target.value)}
      placeholder="Paste or write your text here..."
      rows={5}
      className="field-area"
    />
  );
}
