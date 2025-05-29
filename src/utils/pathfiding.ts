// src/utils/pathfinding.ts
export type PathPoint = {
    id: string;
    position: [number, number, number];
  };
  
  function calculateDistance(pos1: [number, number, number], pos2: [number, number, number]): number {
    const dx = pos1[0] - pos2[0];
    const dy = pos1[1] - pos2[1];
    const dz = pos1[2] - pos2[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  /**
   * Finds a path through all points using the Nearest Neighbor heuristic.
   * @param points An array of points to visit.
   * @returns An ordered array of points representing the path.
   */
  export function findNearestNeighborPath(points: PathPoint[]): PathPoint[] {
    if (!points || points.length === 0) {
      return [];
    }
    if (points.length === 1) {
      return [...points]; // Path is just the single point
    }
  
    const unvisited = [...points];
    const path: PathPoint[] = [];
  
    // Start with the first point (or choose a specific starting point if needed)
    // For simplicity, we take the first point from the input array as the start.
    // Find the actual first point object from the unvisited list to maintain its ID.
    let currentPoint = unvisited.find(p => p.id === points[0].id) || unvisited[0];
    path.push(currentPoint);
    unvisited.splice(unvisited.findIndex(p => p.id === currentPoint.id), 1);
  
  
    while (unvisited.length > 0) {
      let nearestPoint: PathPoint | null = null;
      let minDistance = Infinity;
      let nearestIndex = -1;
  
      for (let i = 0; i < unvisited.length; i++) {
        const distance = calculateDistance(currentPoint.position, unvisited[i].position);
        if (distance < minDistance) {
          minDistance = distance;
          nearestPoint = unvisited[i];
          nearestIndex = i;
        }
      }
  
      if (nearestPoint) {
        currentPoint = nearestPoint;
        path.push(currentPoint);
        unvisited.splice(nearestIndex, 1); // Remove the found point from unvisited
      } else {
        // This case should ideally not be reached if unvisited is not empty
        break;
      }
    }
    return path;
  }