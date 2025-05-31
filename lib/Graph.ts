import type { Vector } from "./Vector.ts";

export type Node<T> = T;
export type Edge<T> = [Node<T>, Node<T>];
export type Graph<T> = Map<Node<T>, Array<Node<T>>>;

type PositionPartial = {
  position: Vector;
};

export function drawNode(
  node: Node<PositionPartial>,
  ctx: CanvasRenderingContext2D,
  color: string,
): void {
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(node.position.x, node.position.y, 8, 0, 2 * Math.PI);
  ctx.stroke();
}

export function getNodeByPosition(
  nodes: Array<Node<PositionPartial>>,
  position: Vector,
): Node<PositionPartial> | null {
  for (const node of nodes) {
    if (
      node.position.x <= position.x + 16 &&
      node.position.x >= position.x - 16 &&
      node.position.y <= position.y + 16 &&
      node.position.y >= position.y - 16
    ) {
      return node;
    }
  }

  return null;
}

export function drawEdge(
  edge: Edge<PositionPartial>,
  ctx: CanvasRenderingContext2D,
  color: string,
): void {
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(edge[0].position.x, edge[0].position.y);
  ctx.lineTo(edge[1].position.x, edge[1].position.y);
  ctx.stroke();
}

export function createGraph<T>(
  nodes: Array<Node<T>>,
  edges: Array<Edge<T>>,
): Graph<T> {
  const graph: Graph<T> = new Map();

  for (const node of nodes) {
    const neighbours = edges.reduce(
      (acc, edge) => {
        if (edge[0] === node) {
          acc.push(edge[1]);
          return acc;
        }

        if (edge[1] === node) {
          acc.push(edge[0]);
          return acc;
        }

        return acc;
      },
      [] as Array<Node<T>>,
    );

    if (neighbours.length > 0) {
      graph.set(node, neighbours);
    }
  }

  return graph;
}

export function originDFS<T>(origin: Node<T>, graph: Graph<T>): Array<Node<T>> {
  const visited: Array<Node<T>> = [origin];

  if (!graph.has(origin)) {
    return visited;
  }

  innerDFS(origin, graph, visited);

  return visited;
}

function innerDFS<T>(
  node: Node<T>,
  graph: Graph<T>,
  visited: Array<Node<T>>,
): void {
  const neighbours = graph.get(node)!;
  for (const node of neighbours) {
    if (visited.includes(node)) {
      continue;
    }

    visited.push(node);
    innerDFS(node, graph, visited);
  }
}

export function getNeighbours<T>(
  graph: Graph<T>,
  node: Node<T>,
): Array<Node<T>> {
  return graph.has(node) ? graph.get(node)! : [];
}
