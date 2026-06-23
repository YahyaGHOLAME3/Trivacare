const CELL_WIDTH = 192;
const CELL_HEIGHT = 208;
const IDLE_FRAMES = 6;
const IDLE_DURATION_MS = 1100;

export function PetPreview() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b,_#020617_55%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-cyan-400/20 bg-slate-950/70 p-6 shadow-2xl backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
            Pet Preview
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white">Aegis</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Dark pixel-fox security sentinel. This page previews the current base sprite
                and the generated idle strip so you can inspect the direction before the full
                atlas is finished.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              Current status: base locked, idle row available, full animation set pending.
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              Canonical Base
            </p>
            <div className="mt-5 flex justify-center rounded-2xl border border-slate-800 bg-black/30 p-4">
              <img
                src="/pet-preview/base.png"
                alt="Aegis base sprite"
                className="h-auto w-full max-w-[240px] image-rendering-pixelated"
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  Idle Loop
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Live stepped playback from the generated idle strip.
                </p>
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                {IDLE_FRAMES} frames
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-start">
              <div className="flex justify-center rounded-2xl border border-cyan-400/20 bg-slate-950 p-6">
                <div
                  aria-label="Animated idle preview"
                  className="pixelated rounded-xl border border-cyan-300/20 bg-[url('/pet-preview/idle.png')] bg-left-top bg-no-repeat"
                  style={{
                    width: `${CELL_WIDTH}px`,
                    height: `${CELL_HEIGHT}px`,
                    backgroundSize: `${CELL_WIDTH * IDLE_FRAMES}px ${CELL_HEIGHT}px`,
                    animation: `pet-idle-steps ${IDLE_DURATION_MS}ms steps(${IDLE_FRAMES}) infinite`,
                  }}
                />
              </div>

              <div className="min-w-0 flex-1 rounded-2xl border border-slate-800 bg-black/20 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  Raw Strip
                </p>
                <img
                  src="/pet-preview/idle.png"
                  alt="Aegis idle strip"
                  className="mt-4 h-auto w-full rounded-lg border border-slate-800 image-rendering-pixelated"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
