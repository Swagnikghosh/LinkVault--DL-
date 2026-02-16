export default function ViewOnceToggle({ viewOnce, setViewOnce }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 select-none text-sm text-orange-100/85">
      <input
        type="checkbox"
        checked={viewOnce}
        onChange={(event) => setViewOnce(event.target.checked)}
        className="h-4 w-4 accent-orange-400"
      />
      View only once
    </label>
  );
}
