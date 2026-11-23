import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Cpu,
  Globe2,
  Layers,
  Network,
  Radio,
  ShieldCheck,
  } from "lucide-react";
import { Container } from "@landing/components/ui/Container";
import { SectionHeading } from "@landing/components/layout/SectionHeading";
import { ORCHESTRATION_NODES, OrchestrationNode } from "@landing/lib/demo-routes";
import { EASING, usePrefersReducedMotion } from "@landing/lib/animation-config";

export function OrchestrationSection() {
  const [activeNodeId, setActiveNodeId] = useState<string>(
    ORCHESTRATION_NODES[0].id
  );
  const prefersReducedMotion = usePrefersReducedMotion();

  const activeNode: OrchestrationNode =
    ORCHESTRATION_NODES.find((n) => n.id === activeNodeId) ||
    ORCHESTRATION_NODES[0];

  return (
    <section
      id="orchestration"
      aria-label="The VIBE Orchestration Engine"
      className="relative bg-velos-navy text-velos-white py-24 sm:py-32 lg:py-40 overflow-hidden border-t border-velos-white/10"
    >
      {/* Subtle 3D Perspective City Grid Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute inset-x-0 bottom-0 h-[75%] opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(102,217,242,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(102,217,242,0.18) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            transform: "perspective(760px) rotateX(62deg) scale(1.6)",
            transformOrigin: "center bottom",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-velos-navy via-transparent to-velos-navy" />
        <div className="absolute inset-0 bg-radial-glow" />
      </div>

      <Container size="wide" className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <SectionHeading
            eyebrow="03 / THE VIBE ORCHESTRATION ENGINE"
            title={
              <>
                ONE INTELLIGENT LAYER.
                <br />
                <span className="text-velos-cyan">
                  AN ENTIRE MOBILITY NETWORK.
                </span>
              </>
            }
            description="VIBE coordinates the digital connections that help turn individual flights into connected journeys."
            theme="dark"
          />

          <div className="flex items-center gap-3 rounded-2xl bg-velos-blue/60 border border-velos-white/10 px-5 py-3.5 self-start lg:self-end">
            <Cpu className="w-4 h-4 text-velos-cyan shrink-0" />
            <span className="text-xs font-mono uppercase tracking-[0.18em] text-velos-mist">
              Select or hover any node to inspect live pathway routing
            </span>
          </div>
        </div>

        {/* Main Interactive Architecture Visualization & State Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-12 items-center">
          {/* Left/Center: Interactive Orbital Network Graph */}
          <div className="lg:col-span-7">
            <div className="relative aspect-square max-w-[660px] mx-auto rounded-3xl bg-velos-blue/35 border border-velos-white/12 backdrop-blur-md p-4 sm:p-8 shadow-[0_32px_90px_rgba(0,0,0,0.55)] overflow-hidden">
              {/* Isometric City Node Backdrop SVG */}
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full pointer-events-none"
                aria-hidden="true"
              >
                {/* Concentric Telemetry Rings */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="rgba(220,227,231,0.1)"
                  strokeWidth="0.25"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="27"
                  stroke="rgba(102,217,242,0.14)"
                  strokeWidth="0.25"
                  strokeDasharray="1.5 1.5"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="15"
                  stroke="rgba(102,217,242,0.22)"
                  strokeWidth="0.3"
                  fill="none"
                />

                {/* Cross-links between Peer Connected Systems of the Active Node */}
                {ORCHESTRATION_NODES.map((node) => {
                  const isSelected = node.id === activeNode.id;
                  const isPeer = activeNode.connectedSystems.includes(node.id);

                  return (
                    <g key={`path-${node.id}`}>
                      {/* Radial line from Central Core (50,50) to each Node */}
                      <line
                        x1="50"
                        y1="50"
                        x2={node.xPercent}
                        y2={node.yPercent}
                        stroke={
                          isSelected
                            ? "#66D9F2"
                            : isPeer
                            ? "rgba(102,217,242,0.55)"
                            : "rgba(168,182,194,0.18)"
                        }
                        strokeWidth={isSelected ? "0.7" : isPeer ? "0.45" : "0.25"}
                        strokeDasharray={isSelected ? "none" : "1.2 1.2"}
                      />

                      {/* Animated signal pulse along active & peer connections */}
                      {(isSelected || isPeer) && !prefersReducedMotion && (
                        <motion.circle
                          r={isSelected ? "0.95" : "0.65"}
                          fill="#66D9F2"
                          initial={{
                            cx: 50,
                            cy: 50,
                            opacity: 0,
                          }}
                          animate={{
                            cx: [50, node.xPercent],
                            cy: [50, node.yPercent],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: isSelected ? 1.5 : 2.2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      )}
                    </g>
                  );
                })}

                {/* Peer-to-peer arcs from activeNode to its connectedSystems */}
                {activeNode.connectedSystems.map((targetId) => {
                  const target = ORCHESTRATION_NODES.find(
                    (n) => n.id === targetId
                  );
                  if (!target) return null;
                  return (
                    <path
                      key={`arc-${activeNode.id}-${target.id}`}
                      d={`M ${activeNode.xPercent} ${activeNode.yPercent} Q 50 50 ${target.xPercent} ${target.yPercent}`}
                      stroke="rgba(102,217,242,0.38)"
                      strokeWidth="0.35"
                      fill="none"
                    />
                  );
                })}
              </svg>

              {/* Center: Glowing Restrained VIBE Core */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-velos-navy border border-velos-cyan/50 shadow-[0_0_50px_rgba(102,217,242,0.28)]">
                  <div className="absolute inset-2 rounded-full border border-velos-white/10" />
                  <div className="text-center px-2">
                    <span className="block text-[9px] font-mono uppercase tracking-[0.24em] text-velos-cyan">
                      CORE OS
                    </span>
                    <span className="font-velos-display text-lg sm:text-xl font-semibold tracking-tight text-velos-white">
                      VIBE
                    </span>
                    <span className="block text-[9px] font-mono text-velos-silver mt-0.5 truncate max-w-[96px]">
                      {activeNode.protocolLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* 8 Surrounding Interactive System Nodes */}
              {ORCHESTRATION_NODES.map((node) => {
                const isSelected = node.id === activeNode.id;
                const isConnectedPeer = activeNode.connectedSystems.includes(
                  node.id
                );

                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setActiveNodeId(node.id)}
                    onMouseEnter={() => setActiveNodeId(node.id)}
                    onFocus={() => setActiveNodeId(node.id)}
                    style={{
                      left: `${node.xPercent}%`,
                      top: `${node.yPercent}%`,
                    }}
                    aria-pressed={isSelected}
                    className={`group absolute -translate-x-1/2 -translate-y-1/2 z-30 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velos-cyan ${
                      isSelected
                        ? "bg-velos-cyan text-velos-navy shadow-[0_0_30px_rgba(102,217,242,0.5)] scale-105"
                        : isConnectedPeer
                        ? "bg-velos-navy/90 text-velos-white border border-velos-cyan/55 hover:border-velos-cyan"
                        : "bg-velos-navy/85 text-velos-mist/85 border border-velos-white/15 hover:border-velos-white/40 hover:text-velos-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          isSelected
                            ? "bg-velos-navy"
                            : isConnectedPeer
                            ? "bg-velos-cyan"
                            : "bg-velos-silver/50"
                        }`}
                      />
                      <span className="font-velos-display text-xs sm:text-sm font-semibold whitespace-nowrap">
                        {node.title}
                      </span>
                    </div>
                    <span
                      className={`hidden sm:block text-[9px] font-mono uppercase tracking-[0.16em] mt-0.5 ${
                        isSelected ? "text-velos-navy/80" : "text-velos-silver"
                      }`}
                    >
                      {node.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Central Interface State & Node Details Inspector */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNode.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: EASING.editorial }}
                className="rounded-3xl bg-velos-blue/50 border border-velos-white/15 p-7 sm:p-8 backdrop-blur-xl shadow-2xl"
              >
                <div className="flex items-center justify-between gap-4 pb-5 border-b border-velos-white/10">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-velos-cyan">
                      ACTIVE SYSTEM NODE // {activeNode.category}
                    </span>
                    <h3 className="font-velos-display text-2xl sm:text-3xl font-semibold text-velos-white mt-1">
                      {activeNode.title}
                    </h3>
                  </div>
                  <div className="h-11 w-11 rounded-2xl bg-velos-cyan/15 border border-velos-cyan/30 flex items-center justify-center text-velos-cyan shrink-0">
                    <Network className="w-5 h-5" />
                  </div>
                </div>

                <p className="mt-5 text-base text-velos-mist/90 leading-relaxed">
                  {activeNode.shortDesc}
                </p>

                {/* Protocol & State Telemetry */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-velos-navy/70 border border-velos-white/10 p-4">
                    <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-velos-silver">
                      PROTOCOL MODULE
                    </span>
                    <span className="mt-1 block font-mono text-xs sm:text-sm font-semibold text-velos-white">
                      {activeNode.protocolLabel}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-velos-navy/70 border border-velos-white/10 p-4">
                    <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-velos-silver">
                      SYNCHRONIZATION
                    </span>
                    <span className="mt-1 block font-mono text-xs sm:text-sm font-semibold text-velos-cyan">
                      {activeNode.latencyMetric}
                    </span>
                  </div>
                </div>

                {/* Connected Peer Systems */}
                <div className="mt-6 pt-5 border-t border-velos-white/10">
                  <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-velos-silver mb-3">
                    LINKED ORCHESTRATION PATHWAYS
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeNode.connectedSystems.map((peerId) => {
                      const peer = ORCHESTRATION_NODES.find(
                        (n) => n.id === peerId
                      );
                      if (!peer) return null;
                      return (
                        <button
                          key={peer.id}
                          type="button"
                          onClick={() => setActiveNodeId(peer.id)}
                          className="inline-flex items-center gap-2 rounded-full bg-velos-white/8 hover:bg-velos-cyan hover:text-velos-navy border border-velos-white/15 px-3.5 py-1.5 text-xs font-medium text-velos-white transition-colors"
                        >
                          <Radio className="w-3 h-3 text-velos-cyan group-hover:text-velos-navy" />
                          <span>{peer.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Accessible Quick-Selector List for All 8 Nodes */}
            <div className="rounded-2xl bg-velos-white/[0.03] border border-velos-white/10 p-5">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-velos-silver mb-3">
                <span className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-velos-cyan" />
                  ALL 8 ORCHESTRATED SUBSYSTEMS
                </span>
                <span className="text-velos-cyan">ONLINE</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                {ORCHESTRATION_NODES.map((node, i) => {
                  const isSelected = node.id === activeNode.id;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setActiveNodeId(node.id)}
                      className={`text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                        isSelected
                          ? "bg-velos-cyan text-velos-navy font-semibold"
                          : "bg-velos-navy/60 text-velos-mist/80 hover:text-velos-white hover:bg-velos-white/10"
                      }`}
                    >
                      <span className="truncate">
                        0{i + 1}. {node.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform Architecture Pillars */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { icon: Activity, label: "Real-Time State", sub: "Event-Driven" },
                { icon: ShieldCheck, label: "Operator Agnostic", sub: "Multi-Fleet" },
                { icon: Globe2, label: "City-Scale", sub: "Multi-Vertiport" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-velos-blue/30 border border-velos-white/10 p-3.5"
                  >
                    <Icon className="w-4 h-4 text-velos-cyan mx-auto mb-1.5" />
                    <div className="text-xs font-semibold text-velos-white">
                      {item.label}
                    </div>
                    <div className="text-[10px] font-mono text-velos-silver">
                      {item.sub}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
