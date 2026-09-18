import Spinner from "./Spinner";

export default function Loading({
  label = "Memuat data...",
  fullScreen = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400 ${
        fullScreen ? "min-h-screen" : "py-16"
      }`}
    >
      <Spinner size={28} />
      <p className="text-sm">{label}</p>
    </div>
  );
}
