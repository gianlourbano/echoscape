interface Coordinate {
  lat: number;
  lng: number;
}

export interface Cluster {
  center: Coordinate;
  count: number;
  properties?: any;
  type?: string;
}

export class MapClusterer {
  private coordinates: Coordinate[];
  private gridSize: number;

  constructor(coordinates: Coordinate[]) {
    this.coordinates = coordinates;
  }

  cluster(zoomLevel: number): Cluster[] {
    // Adjust grid size based on zoom level
    // This is a simple linear relationship; you might want to adjust this
    this.gridSize = Math.max(0.1, 10 - zoomLevel * 0.45);

    const grid: { [key: string]: Cluster } = {};

    for (const coord of this.coordinates) {
      const gridKey = this.getGridKey(coord);
      
      if (!grid[gridKey]) {
        grid[gridKey] = {
          center: { lat: coord.lat, lng: coord.lng },
          count: 1
        };
      } else {
        grid[gridKey].center.lat += coord.lat;
        grid[gridKey].center.lng += coord.lng;
        grid[gridKey].count++;
      }
    }

    // Calculate the average position for each cluster
    return Object.values(grid).map(cluster => ({
      center: {
        lat: cluster.center.lat / cluster.count,
        lng: cluster.center.lng / cluster.count
      },
      count: cluster.count
    }));
  }

  private getGridKey(coord: Coordinate): string {
    const latGrid = Math.floor(coord.lat / this.gridSize);
    const lngGrid = Math.floor(coord.lng / this.gridSize);
    return `${latGrid},${lngGrid}`;
  }
}

// // Example usage
// const coordinates: Coordinate[] = [
//   { lat: 52.5200, lng: 13.4050 },
//   { lat: 52.5201, lng: 13.4052 },
//   { lat: 52.5250, lng: 13.4100 },
//   { lat: 48.8566, lng: 2.3522 },
//   // ... add more coordinates
// ];

// const clusterer = new MapClusterer(coordinates);

// // Simulate different zoom levels
// for (let zoom = 0; zoom <= 20; zoom += 5) {
//   console.log(`Zoom level ${zoom}:`);
//   console.log(clusterer.cluster(zoom));
//   console.log('---');
// }