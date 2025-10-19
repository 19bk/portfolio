'use client';

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

// --- Helpers: fonts & theme -------------------------------------------------
const useFonts = () => {
  useEffect(() => {
    const links = [
      ["preconnect", "https://fonts.googleapis.com"],
      ["preconnect", "https://fonts.gstatic.com", "anonymous"],
      [
        "stylesheet",
        "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;600&display=swap",
      ],
    ].map(([rel, href, cross]) => {
      const link = document.createElement("link");
      link.rel = rel as string;
      link.href = href as string;
      if (cross) {
        link.crossOrigin = cross as string;
      }
      document.head.appendChild(link);
      return link;
    });
    return () => {
      links.forEach((link) => link.remove());
    };
  }, []);
};

type Theme = "light" | "dark";

type ShellProps = {
  children: ReactNode;
  theme: Theme;
};

const Shell = ({ children, theme }: ShellProps) => {
  const isDark = theme === "dark";
  return (
    <div
      className={
        (isDark
          ? "bg-[#0F0F10] text-[#F4F4F2]"
          : "bg-[#FAFAF8] text-[#121212]") + " min-h-screen"
      }
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </div>
    </div>
  );
};

// --- Tiny UI primitives -----------------------------------------------------
type CardProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  onClick?: () => void;
  theme?: Theme;
  children?: ReactNode;
};

const Card = ({
  title,
  subtitle,
  meta,
  children,
  onClick,
  theme = "light",
}: CardProps) => {
  const isDark = theme === "dark";
  const surface = isDark
    ? "bg-[#131315] border-white/10 hover:shadow-[0_6px_24px_rgba(0,0,0,0.35)]"
    : "bg-white border-black/10 hover:shadow-md";
  const metaColor = isDark ? "text-white/60" : "text-black/60";
  const subtitleColor = isDark ? "text-white/70" : "text-black/70";
  return (
    <button onClick={onClick} className="w-full text-left group">
      <div className={`relative border ${surface} transition-shadow rounded-2xl p-5 md:p-6`}>
        {meta && (
          <div
            className={`text-xs tracking-widest uppercase ${metaColor} mb-2`}
            style={{
              fontFamily:
                "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            {meta}
          </div>
        )}
        <div className="flex items-baseline gap-3">
          <h3 className="text-xl md:text-2xl font-semibold leading-tight">
            {title}
          </h3>
        </div>
        {subtitle && (
          <p className={`mt-2 text-sm md:text-[15px] ${subtitleColor}`}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </button>
  );
};

const Dot = ({ theme }: { theme: Theme }) => (
  <span
    className={`inline-block w-2 h-2 rounded-full ${
      theme === "dark" ? "bg-orange-400" : "bg-orange-500"
    } align-middle`}
  ></span>
);

// --- Typewriter -------------------------------------------------------------
type TypewriterProps = {
  text: string;
  speed?: number;
  className?: string;
  startSignal?: number;
};

const Typewriter = ({
  text,
  speed = 115,
  className,
  startSignal = 0,
}: TypewriterProps) => {
  const [index, setIndex] = useState(0);
  const minWidth = useMemo(() => `${text.length}ch`, [text.length]);

  useEffect(() => {
    if (index < text.length) {
      const id = window.setTimeout(() => setIndex(index + 1), speed);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [index, text, speed]);

  useEffect(() => {
    setIndex(0);
  }, [startSignal, text]);

  const shown = text.slice(0, index);
  const caret = index < text.length ? <span className="text-orange-500">▌</span> : null;
  return (
    <span
      className={className}
      style={{
        fontFeatureSettings: '"ss01" 1',
        display: "inline-block",
        minWidth,
        whiteSpace: "pre",
      }}
    >
      {shown}
      {caret}
    </span>
  );
};

// --- TicTacToe with Minimax (fast, tiny) -----------------------------------
const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

const winner = (state: string[]): "X" | "O" | null => {
  for (const [a, b, c] of winningLines) {
    if (state[a] && state[a] === state[b] && state[a] === state[c]) {
      return state[a] as "X" | "O";
    }
  }
  return null;
};

const boardFull = (state: string[]) => state.every(Boolean);

function bestMove(board: string[], me: "O" | "X") {
  const opponent = me === "O" ? "X" : "O";

  function score(state: string[], turn: "O" | "X"): number {
    const w = winner(state);
    if (w === me) return 1;
    if (w === opponent) return -1;
    if (boardFull(state)) return 0;

    let best = turn === me ? -2 : 2;
    for (let i = 0; i < 9; i += 1) {
      if (!state[i]) {
        const nextState = state.slice();
        nextState[i] = turn;
        const value = score(nextState, turn === "O" ? "X" : "O");
        best = turn === me ? Math.max(best, value) : Math.min(best, value);
      }
    }
    return best;
  }

  let move = -1;
  let best = -2;
  for (let i = 0; i < 9; i += 1) {
    if (!board[i]) {
      const nextState = board.slice();
      nextState[i] = me;
      const value = score(nextState, me === "O" ? "X" : "O");
      if (value > best) {
        best = value;
        move = i;
      }
    }
  }
  return move;
}

const TicTacToe = ({ theme }: { theme: Theme }) => {
  const [state, setState] = useState<string[]>(Array(9).fill(""));
  const [next, setNext] = useState<"X" | "O">("X");
  const winnerState = winner(state);
  const isDark = theme === "dark";

  useEffect(() => {
    if (!winnerState && next === "O") {
      const id = window.setTimeout(() => {
        const move = bestMove(state, "O");
        if (move >= 0) {
          const nextState = [...state];
          nextState[move] = "O";
          setState(nextState);
          setNext("X");
        }
      }, 300);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [next, state, winnerState]);

  const handleClick = (index: number) => {
    if (state[index] || winnerState || next !== "X") return;
    const nextState = [...state];
    nextState[index] = "X";
    setState(nextState);
    setNext("O");
  };

  const status = winnerState
    ? winnerState === "X"
      ? "You win!"
      : "Agent wins"
    : boardFull(state)
      ? "Draw"
      : next === "X"
        ? "Your turn"
        : "Agent thinking…";

  return (
    <div>
      <div
        className={`mb-3 text-sm tracking-wide uppercase ${
          isDark ? "text-white/60" : "text-black/60"
        }`}
        style={{
          fontFamily:
            "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        Interactive • Mini game
      </div>
      <div className="grid grid-cols-3 gap-2 w-56">
        {state.map((value, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`aspect-square rounded-xl border ${
              isDark
                ? "border-white/10 bg-[#111215] hover:bg-[#15161a]"
                : "border-black/10 bg-[#FFFDF9] hover:bg-white"
            } text-3xl font-semibold flex items-center justify-center`}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="mt-3 text-[15px]">{status}</div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => {
            setState(Array(9).fill(""));
            setNext("X");
          }}
          className={`px-3 py-1.5 rounded-xl border ${
            isDark
              ? "border-white/10 bg-[#131315] hover:shadow-[0_6px_24px_rgba(0,0,0,0.35)]"
              : "border-black/10 bg-white hover:shadow-sm"
          }`}
        >
          Reset
        </button>
      </div>
      <p
        className={`${isDark ? "text-white/60" : "text-black/60"} mt-4 text-xs`}
      >
        Model note: Using a fast minimax agent (drop-in place for your trained
        model API).
      </p>
    </div>
  );
};

// --- Dev sanity tests (run once) -------------------------------------------
function runTttTests() {
  console.assert(bestMove(["O", "O", "", "", "", "", "", "", ""], "O") === 2, "Test: O completes row 0");
  console.assert(bestMove(["X", "X", "", "", "", "", "", "", ""], "O") === 2, "Test: O blocks X row 0");
  console.assert(bestMove(["O", "", "", "", "O", "", "", "", ""], "O") === 8, "Test: O completes diagonal");
}

// --- Page -------------------------------------------------------------------
export default function Portfolio() {
  useFonts();
  const [theme, setTheme] = useState<Theme>("light");
  const isDark = theme === "dark";
  const [heroSignal, setHeroSignal] = useState(1);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      runTttTests();
    }
  }, []);

  const projects = [
    { meta: "JavaScript", title: "Dinero.js", subtitle: "Immutable money library. Format, calculate, convert." },
    { meta: "JavaScript", title: "Browserstore.js", subtitle: "Persist data across browser storage systems." },
    { meta: "TypeScript", title: "Snippets.js", subtitle: "Extract code snippets from source files." },
  ];
  const talks = [
    { city: "Austin, USA", date: "Mar 2, 2020", title: "Test‑Driven Development with Vue.js" },
    { city: "Amsterdam, NL", date: "Feb 20, 2020", title: "Test‑Driven Development with Vue.js" },
    { city: "Paris, FR", date: "Dec 4, 2019", title: "In Defense of Utility‑First CSS" },
    { city: "Toronto, CA", date: "Nov 11, 2019", title: "Test‑Driven Development with Vue.js" },
  ];

  const accentProject = useMemo(
    () => Math.floor(Math.random() * projects.length),
    [projects.length],
  );
  const accentTalk = useMemo(
    () => Math.floor(Math.random() * talks.length),
    [talks.length],
  );

  return (
    <Shell theme={theme}>
      {/* Header */}
      <header className="mb-10 md:mb-16">
        <div className="flex items-center justify-between">
          <div
            className={`text-[13px] tracking-widest uppercase ${
              isDark ? "text-white/60" : "text-black/60"
            }`}
            style={{
              fontFamily:
                "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            Portfolio
          </div>
          <nav className="flex items-center gap-4 text-[15px]">
            <a className="hover:underline hover:text-orange-600" href="#projects">
              Projects
            </a>
            <a className="hover:underline hover:text-orange-600" href="#talks">
              Talks
            </a>
            <a className="hover:underline hover:text-orange-600" href="#game">
              Game
            </a>
            <a className="hover:underline hover:text-orange-600" href="#contact">
              Contact
            </a>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`px-2.5 py-1 rounded-xl border ${
                isDark
                  ? "border-white/10 bg-[#131315]"
                  : "border-black/10 bg-white"
              }`}
              style={{
                fontFamily:
                  "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              {isDark ? "Light" : "Dark"}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="grid md:grid-cols-2 gap-8 md:gap-14 items-start mb-12 md:mb-16">
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[0.95] tracking-tight"
        >
          <span>Hello, I’m </span>
          <span
            onMouseEnter={() => setHeroSignal((value) => value + 1)}
            className="relative group cursor-pointer underline decoration-[3px] decoration-orange-500 underline-offset-8"
          >
            <Typewriter text="Bernard" startSignal={heroSignal} />
            <motion.span
              key={heroSignal}
              className="absolute -bottom-2 left-0 right-0 h-1 bg-orange-500/90 rounded-full"
              style={{ originX: 0 }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </span>
          <span>.</span>
        </motion.h1>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className={`${
            isDark ? "text-white/75" : "text-black/75"
          } text-[15px] md:text-base max-w-prose`}
        >
          Senior engineer building things at the edge of hardware, data, and
          product. I write about trading automation, IoT reliability, and
          pragmatic UI systems. Here you’ll find selected work, talks, and a
          tiny game powered by an agent.
        </motion.p>
      </section>

      {/* Projects */}
      <section id="projects" className="mb-12 md:mb-16">
        <div className="flex items-center gap-2 mb-4">
          <Dot theme={theme} />
          <h2 className="text-2xl font-semibold">Featured Projects</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className={index === accentProject ? "ring-1 ring-orange-400/70 rounded-2xl" : ""}
            >
              <Card
                theme={theme}
                meta={project.meta}
                title={project.title}
                subtitle={project.subtitle}
              />
            </div>
          ))}
          <Card
            theme={theme}
            meta="Interactive"
            title="Play Tic‑Tac‑Toe vs Agent"
            subtitle="A lightweight demo using a minimax model."
            onClick={() => {
              document
                .getElementById("game")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>
      </section>

      {/* Talks */}
      <section id="talks" className="mb-12 md:mb-16">
        <div className="flex items-center gap-2 mb-4">
          <Dot theme={theme} />
          <h2 className="text-2xl font-semibold">Talks</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {talks.map((talk, index) => (
            <div
              key={`${talk.title}-${talk.city}`}
              className={`rounded-2xl border p-5 ${
                isDark
                  ? "border-white/10 bg-[#131315]"
                  : "border-black/10 bg-white"
              } ${index === accentTalk ? "ring-1 ring-orange-400/70" : ""}`}
            >
              <div
                className={`text-xs uppercase tracking-widest ${
                  isDark ? "text-white/60" : "text-black/60"
                }`}
                style={{
                  fontFamily:
                    "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                {talk.city} • {talk.date}
              </div>
              <div className="mt-2 text-lg font-semibold leading-snug">
                {talk.title}
              </div>
              <div
                className={`${
                  isDark ? "text-white/60" : "text-black/60"
                } mt-2 text-sm`}
              >
                Video · Slides
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Game */}
      <section id="game" className="mb-12 md:mb-16">
        <div className="flex items-center gap-2 mb-4">
          <Dot theme={theme} />
          <h2 className="text-2xl font-semibold">Agent Mini‑Game</h2>
        </div>
        <div
          className={`rounded-2xl border p-5 md:p-6 ${
            isDark ? "border-white/10 bg-[#131315]" : "border-black/10 bg-white"
          }`}
        >
          <div className="grid md:grid-cols-2 gap-8">
            <TicTacToe theme={theme} />
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Swap in your ML model
              </h3>
              <ol
                className={`${
                  isDark ? "text-white/75" : "text-black/75"
                } list-decimal pl-5 text-[15px] space-y-1`}
              >
                <li>
                  Expose a POST /move endpoint returning the best cell index 0–8.
                </li>
                <li>
                  Replace{" "}
                  <code
                    style={{
                      fontFamily:
                        "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
                    }}
                  >
                    bestMove
                  </code>{" "}
                  with a fetch to that endpoint.
                </li>
                <li>
                  Ensure the API replies in &lt;100ms for a snappy feel.
                </li>
              </ol>
              <pre
                className={`mt-3 text-xs rounded-xl p-3 overflow-auto border ${
                  isDark
                    ? "bg-[#111215] border-white/10"
                    : "bg-[#FFFDF9] border-black/10"
                }`}
                style={{
                  fontFamily:
                    "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >{`// example
async function bestMoveRemote(board){
  const r = await fetch('/api/ttt',{method:'POST',body:JSON.stringify({board})});
  const { move } = await r.json();
  return move; // 0..8
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className={`pt-6 border-t ${
          isDark ? "border-white/10" : "border-black/10"
        }`}
      >
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div
            className={`${
              isDark ? "text-white/70" : "text-black/70"
            } text-sm`}
          >
            © {new Date().getFullYear()} Bernard Kibathi. Built with React +
            Tailwind.
          </div>
          <div className="flex gap-3 md:justify-end">
            <a
              className={`px-3 py-1.5 rounded-xl border ${
                isDark
                  ? "border-white/10 bg-[#131315] hover:shadow-[0_6px_24px_rgba(0,0,0,0.35)]"
                  : "border-black/10 bg-white hover:shadow-sm"
              }`}
              href="#"
            >
              Twitter
            </a>
            <a
              className={`px-3 py-1.5 rounded-xl border ${
                isDark
                  ? "border-white/10 bg-[#131315] hover:shadow-[0_6px_24px_rgba(0,0,0,0.35)]"
                  : "border-black/10 bg-white hover:shadow-sm"
              }`}
              href="#"
            >
              GitHub
            </a>
            <a
              className={`px-3 py-1.5 rounded-xl border ${
                isDark
                  ? "border-white/10 bg-[#131315] hover:shadow-[0_6px_24px_rgba(0,0,0,0.35)]"
                  : "border-black/10 bg-white hover:shadow-sm"
              }`}
              href="mailto:hello@example.com"
            >
              Email
            </a>
          </div>
        </div>
      </footer>
    </Shell>
  );
}
