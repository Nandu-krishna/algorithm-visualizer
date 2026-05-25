import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import './App.css';

const ALGORITHMS = {
  dijkstra: {
    label: 'Dijkstra',
    endpoint: '/api/dijkstra',
    description: 'Shortest weighted path using priority queue',
  },
  bfs: {
    label: 'BFS',
    endpoint: '/api/bfs',
    description: 'Shortest hop path using queue, ignores weights',
  },
};

const COLORS = {
  nodeDefault: { fill: '#f1f5f9', stroke: '#cbd5e1' },
  nodeStart: { fill: '#6366f1', stroke: '#818cf8' },
  nodeCurrent: { fill: '#f59e0b', stroke: '#fbbf24' },
  nodeVisited: { fill: '#10b981', stroke: '#34d399' },
  edge: '#94a3b8',
  edgeLabel: '#64748b',
  edgeLabelBg: '#ffffff',
  arrow: '#94a3b8',
  text: '#ffffff',
  textDark: '#0f172a',
};

const App = () => {
  const [nodes, setNodes] = useState([1, 2, 3, 4]);
  const [edges, setEdges] = useState([
    { source: 1, destination: 2, weight: 4 },
    { source: 1, destination: 3, weight: 2 },
    { source: 3, destination: 2, weight: 1 },
    { source: 2, destination: 4, weight: 5 },
    { source: 3, destination: 4, weight: 8 },
  ]);
  const [startNode, setStartNode] = useState(1);
  const [newNode, setNewNode] = useState('');
  const [edgeSrc, setEdgeSrc] = useState('');
  const [edgeDst, setEdgeDst] = useState('');
  const [edgeWgt, setEdgeWgt] = useState('');
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [status, setStatus] = useState('idle');
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const svgRef = useRef();
  const canvasRef = useRef();
  const intervalRef = useRef();

  const currentStep = steps[stepIdx] || null;

  const getNodeStyle = useCallback((n) => {
    if (!currentStep) {
      return n === startNode ? COLORS.nodeStart : COLORS.nodeDefault;
    }
    if (currentStep.currentNode === n) return COLORS.nodeCurrent;
    if ((currentStep.visitedNodes || []).includes(n)) return COLORS.nodeVisited;
    if (n === startNode) return COLORS.nodeStart;
    return COLORS.nodeDefault;
  }, [currentStep, startNode]);

  const getPositions = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return {};
    const W = svg.clientWidth || 800;
    const H = svg.clientHeight || 600;
    const cx = W / 2;
    const cy = H / 2;
    const r = Math.min(W, H) * 0.34;
    const pos = {};
    nodes.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
      pos[n] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
    return pos;
  }, [nodes]);

  const drawGraph = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const pos = getPositions();
    const sel = d3.select(svg);
    sel.selectAll('*').remove();

    const defs = sel.append('defs');

    defs
      .append('pattern')
      .attr('id', 'grid')
      .attr('width', 24)
      .attr('height', 24)
      .attr('patternUnits', 'userSpaceOnUse')
      .append('path')
      .attr('d', 'M 24 0 L 0 0 0 24')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(148, 163, 184, 0.12)')
      .attr('stroke-width', 1);

    sel
      .append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#grid)');

    defs
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 32)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', COLORS.arrow);

    const eg = sel.append('g');
    edges.forEach((e) => {
      const p1 = pos[e.source];
      const p2 = pos[e.destination];
      if (!p1 || !p2) return;
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      eg.append('line')
        .attr('x1', p1.x)
        .attr('y1', p1.y)
        .attr('x2', p2.x)
        .attr('y2', p2.y)
        .attr('stroke', COLORS.edge)
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrow)');
      eg.append('rect')
        .attr('x', mx - 14)
        .attr('y', my - 10)
        .attr('width', 28)
        .attr('height', 18)
        .attr('rx', 6)
        .attr('fill', COLORS.edgeLabelBg)
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1);
      eg.append('text')
        .attr('x', mx)
        .attr('y', my)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', COLORS.edgeLabel)
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(e.weight);
    });

    const ng = sel.append('g');
    nodes.forEach((n) => {
      const p = pos[n];
      if (!p) return;
      const style = getNodeStyle(n);
      const isLight = style === COLORS.nodeDefault;
      ng.append('circle')
        .attr('cx', p.x)
        .attr('cy', p.y)
        .attr('r', 28)
        .attr('fill', style.fill)
        .attr('stroke', style.stroke)
        .attr('stroke-width', 2.5)
        .attr('filter', 'drop-shadow(0 2px 6px rgba(15, 23, 42, 0.08))');
      ng.append('text')
        .attr('x', p.x)
        .attr('y', p.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', isLight ? COLORS.textDark : COLORS.text)
        .attr('font-size', '14px')
        .attr('font-weight', '700')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(n);
    });
  }, [nodes, edges, getPositions, getNodeStyle]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph, stepIdx, steps]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => drawGraph());
    ro.observe(el);
    return () => ro.disconnect();
  }, [drawGraph]);

  const addNode = () => {
    const v = parseInt(newNode);
    if (!isNaN(v) && !nodes.includes(v)) {
      setNodes((prev) => [...prev, v].sort((a, b) => a - b));
      setNewNode('');
    }
  };

  const addEdge = () => {
    const s = parseInt(edgeSrc);
    const d = parseInt(edgeDst);
    const w = parseInt(edgeWgt);
    if (!isNaN(s) && !isNaN(d) && !isNaN(w)) {
      setEdges((prev) => [...prev, { source: s, destination: d, weight: w }]);
      let updated = [...nodes];
      if (!updated.includes(s)) updated.push(s);
      if (!updated.includes(d)) updated.push(d);
      setNodes(updated.sort((a, b) => a - b));
      setEdgeSrc('');
      setEdgeDst('');
      setEdgeWgt('');
    }
  };

  const runAlgorithm = async () => {
    stopPlay();
    setStatus('loading');
    setSteps([]);
    setStepIdx(-1);
    const { endpoint } = ALGORITHMS[algorithm];
    try {
      const res = await axios.post(`https://algorithm-visualizer-api-production-c85e.up.railway.app${endpoint}`, {
        nodes,
        edges,
        startNode,
      });
      setSteps(res.data);
      setStepIdx(0);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const resetAll = () => {
    stopPlay();
    setNodes([1, 2, 3, 4]);
    setEdges([
      { source: 1, destination: 2, weight: 4 },
      { source: 1, destination: 3, weight: 2 },
      { source: 3, destination: 2, weight: 1 },
      { source: 2, destination: 4, weight: 5 },
      { source: 3, destination: 4, weight: 8 },
    ]);
    setStartNode(1);
    setSteps([]);
    setStepIdx(-1);
    setStatus('idle');
  };

  const stopPlay = () => {
    setPlaying(false);
    clearInterval(intervalRef.current);
  };

  const togglePlay = () => {
    if (playing) {
      stopPlay();
      return;
    }
    if (steps.length === 0) return;
    setPlaying(true);
    intervalRef.current = setInterval(() => {
      setStepIdx((prev) => {
        if (prev >= steps.length - 1) {
          stopPlay();
          return prev;
        }
        return prev + 1;
      });
    }, speed);
  };

  const formatDist = (v) =>
    v === undefined || v === null || v >= 2147483647 ? '∞' : v;

  const isInf = (v) =>
    !currentStep || v === undefined || v === null || v >= 2147483647;

  return (
    <div className="app">
      <aside className="sidebar">
        <header className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">D</div>
            <div>
              <div className="sidebar-title">Algorithm Visualizer</div>
              <div className="sidebar-subtitle">Shortest path explorer</div>
            </div>
          </div>
        </header>

        <div className="algo-picker">
          <div className="algo-tabs">
            {Object.entries(ALGORITHMS).map(([key, { label }]) => (
              <button
                key={key}
                type="button"
                className={`algo-tab ${algorithm === key ? 'algo-tab--active' : 'algo-tab--inactive'}`}
                onClick={() => {
                  setAlgorithm(key);
                  stopPlay();
                  setSteps([]);
                  setStepIdx(-1);
                  setStatus('idle');
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="algo-desc">{ALGORITHMS[algorithm].description}</p>
        </div>

        <section className="card">
          <div className="card-title">Graph Builder</div>
          <div className="row">
            <input
              className="input"
              type="number"
              placeholder="Node ID"
              value={newNode}
              onChange={(e) => setNewNode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNode()}
            />
            <button className="btn btn--success" onClick={addNode}>
              + Node
            </button>
          </div>
          <div className="tags">
            {nodes.map((n) => (
              <span key={n} className="tag">
                {n}
                <span
                  className="tag-remove"
                  onClick={() => {
                    setNodes((p) => p.filter((x) => x !== n));
                    setEdges((p) =>
                      p.filter((e) => e.source !== n && e.destination !== n)
                    );
                  }}
                >
                  ×
                </span>
              </span>
            ))}
          </div>
          <div className="row">
            <input
              className="input input--sm"
              type="number"
              placeholder="From"
              value={edgeSrc}
              onChange={(e) => setEdgeSrc(e.target.value)}
            />
            <input
              className="input input--sm"
              type="number"
              placeholder="To"
              value={edgeDst}
              onChange={(e) => setEdgeDst(e.target.value)}
            />
            <input
              className="input input--xs"
              type="number"
              placeholder="Wt"
              value={edgeWgt}
              onChange={(e) => setEdgeWgt(e.target.value)}
            />
            <button className="btn btn--success" onClick={addEdge}>
              + Edge
            </button>
          </div>
          <div className="tags">
            {edges.map((e, i) => (
              <span key={i} className="tag">
                {e.source}→{e.destination}({e.weight})
                <span
                  className="tag-remove"
                  onClick={() => setEdges((p) => p.filter((_, j) => j !== i))}
                >
                  ×
                </span>
              </span>
            ))}
          </div>
          <div className="row">
            <label className="label">Start</label>
            <input
              className="input input--start"
              type="number"
              value={startNode}
              onChange={(e) => setStartNode(parseInt(e.target.value) || 1)}
            />
            <button className="btn btn--primary" onClick={runAlgorithm}>
              Run
            </button>
            <button className="btn btn--ghost" onClick={resetAll}>
              Reset
            </button>
          </div>
          {status === 'error' && (
            <div className="status-error">
              Cannot connect to backend. Make sure the server is running.
            </div>
          )}
          {status === 'loading' && (
            <div className="status-loading">Computing shortest paths…</div>
          )}
        </section>

        <section className="card">
          <div className="card-title">Playback</div>
          <div className="step-indicator">
            {steps.length > 0
              ? `Step ${stepIdx + 1} of ${steps.length}`
              : 'Run the algorithm to begin'}
          </div>
          <div className="controls-row">
            <button
              className="btn btn--ghost"
              onClick={() => setStepIdx((p) => Math.max(0, p - 1))}
              disabled={steps.length === 0}
            >
              Prev
            </button>
            <button
              className={playing ? 'btn btn--danger' : 'btn btn--primary'}
              onClick={togglePlay}
              disabled={steps.length === 0}
            >
              {playing ? 'Pause' : 'Play'}
            </button>
            <button
              className="btn btn--ghost"
              onClick={() =>
                setStepIdx((p) => Math.min(steps.length - 1, p + 1))
              }
              disabled={steps.length === 0}
            >
              Next
            </button>
          </div>
          <div className="speed-row">
            <span>Slow</span>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={speed}
              onChange={(e) => {
                setSpeed(parseInt(e.target.value));
                if (playing) stopPlay();
              }}
            />
            <span>{(speed / 1000).toFixed(1)}s</span>
          </div>
        </section>

        <section className="card">
          <div className="card-title">Current Step</div>
          <div className="step-desc">
            {currentStep?.description ||
              'Run the algorithm to see step-by-step explanations here.'}
          </div>
        </section>

        <section className="card">
          <div className="card-title">Distances from node {startNode}</div>
          <table className="dist-table">
            <thead>
              <tr>
                <th>Node</th>
                <th>Distance</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((n) => {
                const dist = currentStep?.distances?.[n];
                const highlight =
                  currentStep?.currentNode === n ||
                  (currentStep?.visitedNodes || []).includes(n);
                return (
                  <tr
                    key={n}
                    className={highlight ? 'dist-row--highlight' : undefined}
                  >
                    <td>{n}</td>
                    <td
                      className={
                        isInf(dist) ? 'dist-value--inf' : 'dist-value'
                      }
                    >
                      {formatDist(dist)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </aside>

      <main className="canvas-area" ref={canvasRef}>
        <div className="canvas-toolbar">
          <h2>Graph visualization</h2>
          <div className="legend">
            <span className="legend-item">
              <span className="legend-dot legend-dot--start" /> Start
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--current" /> Current
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--visited" /> Visited
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--default" /> Unvisited
            </span>
          </div>
        </div>
        <svg ref={svgRef} className="graph-svg" />
        {steps.length === 0 && (
          <div className="canvas-empty">
            <div className="empty-icon">◇</div>
            <div className="empty-title">Ready to visualize</div>
            <div className="empty-hint">
              Build your graph in the sidebar, then click Run
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
