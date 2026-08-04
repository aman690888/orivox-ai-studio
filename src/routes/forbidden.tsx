import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/forbidden")({
  head: () => ({ meta: [{ title: "Forbidden — Orivox" }] }),
  component: ForbiddenPage,
});

const R = {
  tag: "4px 22px 6px 18px / 22px 6px 18px 4px",
  card: "6px 38px 6px 42px / 38px 6px 42px 6px",
};

function ForbiddenPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
      style={{ background: "#fdfbf7", backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)", backgroundSize: "24px 24px" }}
    >
      <div
        className="p-10 bg-white border-[3px] border-[#2d2d2d] shadow-[6px_6px_0px_0px_#ff4d4d] flex flex-col items-center gap-5 max-w-md"
        style={{ borderRadius: R.card }}
      >
        <div className="text-5xl">🚧</div>
        <h1 className="text-4xl font-bold text-[#2d2d2d]" style={{ fontFamily: "Kalam, cursive" }}>
          403 Forbidden
        </h1>
        <p className="text-sm text-[#6b6460]" style={{ fontFamily: "Patrick Hand, cursive" }}>
          You don't have permission to access this resource. It might belong to another user.
        </p>
        <div className="flex gap-3">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-[#2d2d2d] text-white border-[2.5px] border-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d] hover:bg-[#e5e0d8] hover:text-[#2d2d2d] hover:shadow-[2px_2px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
