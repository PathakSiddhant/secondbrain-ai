"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic"; // 👈 1. Import dynamic
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";

// 👈 2. ForceGraph2D ko aise import kar (SSR: false)
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-80 text-zinc-500">
      <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
    </div>
  ),
});

export default function KnowledgeGraph({ userId }) {
  const { theme } = useTheme();
  const graphRef = useRef();
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  // Determine colors based on theme
  const isDark = theme === "dark" || theme === "system";
  const bgColor = isDark ? "#18181b" : "#ffffff";
  const textColor = isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)";

  useEffect(() => {
    if (!userId) return;

    fetch(`http://127.0.0.1:8000/graph/${userId}`)
      .then((res) => res.json())
      .then((graphData) => {
        setData(graphData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Graph error:", err);
        setLoading(false); // Error aaye toh bhi loading hata de
      });
  }, [userId]);

  if (loading) {
    return (
      <div className="h-80 w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="h-80 w-full rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 relative">
      <ForceGraph2D
        ref={graphRef}
        width={800} // Container width adjust karega
        height={320}
        graphData={data}
        backgroundColor={bgColor}
        nodeLabel="name"
        nodeColor="color"
        nodeRelSize={6}
        linkColor={() => isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
        onNodeClick={(node) => {
            if (graphRef.current) {
                graphRef.current.centerAt(node.x, node.y, 1000);
                graphRef.current.zoom(2, 2000);
            }
        }}
        cooldownTicks={100}
        onEngineStop={() => {
            if (graphRef.current) graphRef.current.zoomToFit(400);
        }}
      />
      
      {/* Overlay Title */}
      <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 pointer-events-none">
        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
          Neural Network • {data.nodes.length > 0 ? data.nodes.length - 1 : 0} Memories
        </span>
      </div>
    </div>
  );
}