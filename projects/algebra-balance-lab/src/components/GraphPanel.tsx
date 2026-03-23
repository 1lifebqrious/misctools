import { useEffect, useMemo, useRef, useState } from "react";
import { GRAPH_HEIGHT, GRAPH_WIDTH } from "../constants";
import {
  formatNumber,
  linePath,
  noobGraphState,
  proGraphState,
  projectPoint
} from "../lib/math";
import type { NoobEquation, ProEquation } from "../types";

function useTweenedValues(target: number[], duration = 360) {
  const [current, setCurrent] = useState(target);
  const rafRef = useRef<number | null>(null);
  const currentRef = useRef(target);

  useEffect(() => {
    const from = currentRef.current;
    if (
      from.length === target.length &&
      from.every((value, index) => Math.abs(value - target[index]) < 0.0001)
    ) {
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = target.map((value, index) => from[index] + (value - from[index]) * eased);
      currentRef.current = next;
      setCurrent(next);
      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [duration, target]);

  return current;
}

function GraphGrid({
  minX,
  maxX,
  minY,
  maxY
}: {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}) {
  const xTicks = buildIntegerTicks(minX, maxX);
  const yTicks = buildIntegerTicks(minY, maxY);
  const yAxis = projectPoint(0, 0, { minX, maxX, minY, maxY }, GRAPH_WIDTH, GRAPH_HEIGHT).x;
  const xAxis = projectPoint(0, 0, { minX, maxX, minY, maxY }, GRAPH_WIDTH, GRAPH_HEIGHT).y;

  return (
    <g>
      {xTicks.map((tick) => {
        const point = projectPoint(tick, 0, { minX, maxX, minY, maxY }, GRAPH_WIDTH, GRAPH_HEIGHT);
        return (
          <g key={`x-${tick}`}>
            <line className="graph-grid-line" x1={point.x} y1={0} x2={point.x} y2={GRAPH_HEIGHT} />
            <text className="graph-axis-label" x={point.x + 4} y={GRAPH_HEIGHT - 8}>
              {tick}
            </text>
          </g>
        );
      })}
      {yTicks.map((tick) => {
        const point = projectPoint(0, tick, { minX, maxX, minY, maxY }, GRAPH_WIDTH, GRAPH_HEIGHT);
        return (
          <g key={`y-${tick}`}>
            <line className="graph-grid-line" x1={0} y1={point.y} x2={GRAPH_WIDTH} y2={point.y} />
            <text className="graph-axis-label" x={8} y={point.y - 6}>
              {tick}
            </text>
          </g>
        );
      })}
      <line className="graph-axis-line y-axis" x1={yAxis} y1={0} x2={yAxis} y2={GRAPH_HEIGHT} />
      <line className="graph-axis-line x-axis" x1={0} y1={xAxis} x2={GRAPH_WIDTH} y2={xAxis} />
    </g>
  );
}

function buildIntegerTicks(min: number, max: number) {
  const step = niceIntegerStep(max - min);
  const ticks: number[] = [];
  const start = Math.ceil(min / step) * step;

  for (let tick = start; tick <= max; tick += step) {
    ticks.push(tick);
  }

  return ticks;
}

function niceIntegerStep(span: number) {
  const rough = Math.max(1, span / 8);
  const power = Math.pow(10, Math.floor(Math.log10(rough)));
  const normalized = rough / power;

  if (normalized <= 1) {
    return power;
  }
  if (normalized <= 2) {
    return 2 * power;
  }
  if (normalized <= 5) {
    return 5 * power;
  }
  return 10 * power;
}

type GraphPanelProps =
  | {
      level: "noob";
      equation: NoobEquation;
      hiddenMessage?: string;
      hidden?: boolean;
    }
  | {
      level: "pro";
      equations: [ProEquation, ProEquation];
      hiddenMessage?: string;
      hidden?: boolean;
    };

function GraphPanel(props: GraphPanelProps) {
  const hidden = props.hidden ?? false;

  const noobTarget = useMemo(() => {
    if (props.level !== "noob") {
      return null;
    }
    const graph = noobGraphState(props.equation);
    return [
      graph.slope,
      graph.intercept,
      graph.targetY,
      graph.solutionX,
      graph.solutionY,
      graph.viewport.minX,
      graph.viewport.maxX,
      graph.viewport.minY,
      graph.viewport.maxY
    ];
  }, [props]);

  const proTarget = useMemo(() => {
    if (props.level !== "pro") {
      return null;
    }
    const graph = proGraphState(props.equations);
    return [
      graph.first.slope,
      graph.first.intercept,
      graph.second.slope,
      graph.second.intercept,
      graph.solutionX,
      graph.solutionY,
      graph.viewport.minX,
      graph.viewport.maxX,
      graph.viewport.minY,
      graph.viewport.maxY
    ];
  }, [props]);

  const animatedNoob = useTweenedValues(noobTarget ?? [0, 0, 0, 0, 0, -5, 5, -5, 5]);
  const animatedPro = useTweenedValues(proTarget ?? [1, 0, -1, 0, 0, 0, -5, 5, -5, 5]);

  if (hidden) {
    return (
      <section className="graph-shell waiting">
        <p className="eyebrow">Graph waiting room</p>
        <h3>Nothing to draw yet</h3>
        <p>{props.hiddenMessage}</p>
      </section>
    );
  }

  if (props.level === "noob") {
    const [slope, intercept, targetY, solutionX, solutionY, minX, maxX, minY, maxY] = animatedNoob;
    const viewport = { minX, maxX, minY, maxY };
    const point = projectPoint(solutionX, solutionY, viewport, GRAPH_WIDTH, GRAPH_HEIGHT);
    const xAxisPoint = projectPoint(solutionX, 0, viewport, GRAPH_WIDTH, GRAPH_HEIGHT);
    const line = linePath(slope, intercept, viewport, GRAPH_WIDTH, GRAPH_HEIGHT);
    const target = linePath(0, targetY, viewport, GRAPH_WIDTH, GRAPH_HEIGHT);

    return (
      <section className="graph-shell" aria-label="Noob graph">
        <div className="graph-title-row">
        <div>
          <p className="eyebrow">Live graph</p>
          <h3>Where the line hits the target</h3>
        </div>
        <span className="graph-pill">
          <span className="equation-variable variable-x">X</span> = {formatNumber(solutionX)}
        </span>
      </div>
        <svg viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} className="graph-canvas">
          <GraphGrid minX={minX} maxX={maxX} minY={minY} maxY={maxY} />
          <path d={target} className="target-line" />
          <path d={line} className="equation-line" />
          <line
            className="guide-line"
            x1={point.x}
            y1={point.y}
            x2={xAxisPoint.x}
            y2={xAxisPoint.y}
          />
          <circle className="solution-point" cx={point.x} cy={point.y} r={6} />
          <text className="graph-callout" x={point.x + 10} y={point.y - 10}>
            ({formatNumber(solutionX)}, {formatNumber(solutionY)})
          </text>
        </svg>
      </section>
    );
  }

  const [firstSlope, firstIntercept, secondSlope, secondIntercept, solutionX, solutionY, minX, maxX, minY, maxY] =
    animatedPro;
  const viewport = { minX, maxX, minY, maxY };
  const point = projectPoint(solutionX, solutionY, viewport, GRAPH_WIDTH, GRAPH_HEIGHT);
  const firstLine = linePath(firstSlope, firstIntercept, viewport, GRAPH_WIDTH, GRAPH_HEIGHT);
  const secondLine = linePath(secondSlope, secondIntercept, viewport, GRAPH_WIDTH, GRAPH_HEIGHT);

  return (
    <section className="graph-shell" aria-label="Pro graph">
      <div className="graph-title-row">
        <div>
          <p className="eyebrow">Live graph</p>
          <h3>One point fits both lines</h3>
        </div>
        <span className="graph-pill">
          <span className="equation-variable variable-x graph-pill-variable">X</span> ={" "}
          {formatNumber(solutionX)},{" "}
          <span className="equation-variable variable-y graph-pill-variable">Y</span> ={" "}
          {formatNumber(solutionY)}
        </span>
      </div>
      <svg viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} className="graph-canvas">
        <GraphGrid minX={minX} maxX={maxX} minY={minY} maxY={maxY} />
        <path d={firstLine} className="equation-line first" />
        <path d={secondLine} className="equation-line second" />
        <circle className="solution-point" cx={point.x} cy={point.y} r={7} />
        <text className="graph-callout" x={point.x + 10} y={point.y - 10}>
          ({formatNumber(solutionX)}, {formatNumber(solutionY)})
        </text>
      </svg>
    </section>
  );
}

export default GraphPanel;
