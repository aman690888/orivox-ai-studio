export class SlideDependencyGraph {
  private adjacencyList: Map<string, string[]> = new Map();

  /**
   * Adds a directed dependency: slideA depends on slideB.
   * If slideB changes, slideA may need regeneration.
   */
  public addDependency(dependentSlideId: string, prerequisiteSlideId: string): void {
    const edges = this.adjacencyList.get(prerequisiteSlideId) || [];
    if (!edges.includes(dependentSlideId)) {
      edges.push(dependentSlideId);
      this.adjacencyList.set(prerequisiteSlideId, edges);
    }
  }

  /**
   * Returns all slides that must be regenerated if the target slide is mutated.
   */
  public getAffectedSlides(mutatedSlideId: string): string[] {
    const affected = new Set<string>();
    const queue = [mutatedSlideId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const dependents = this.adjacencyList.get(current) || [];
      dependents.forEach((dep) => {
        if (!affected.has(dep)) {
          affected.add(dep);
          queue.push(dep);
        }
      });
    }

    return Array.from(affected);
  }

  public clear(): void {
    this.adjacencyList.clear();
  }
}
