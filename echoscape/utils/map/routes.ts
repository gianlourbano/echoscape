import { LatLng } from "react-native-maps";

/*
fetches a route from open street map
the optional function can be used when the function is called in react components
otherwise it just prints the result and prints the coordinates of the nodes
*/
export const fetchRoute = async (startLat, startLng, endLat, endLng, setRouteCoordinates?: ([]) => void) => {
    try {
        const response = await fetch(
            `${process.env.EXPO_PUBLIC_OSRM_API_URL}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        //console.log(JSON.stringify(data, null, 2));
        const routeCoords = data.routes[0].geometry.coordinates.map(
            (point) => ({
                latitude: point[1],
                longitude: point[0],
            })
        );
        //setRouteCoordinates(routeCoords);
        return routeCoords
    } catch (error) {
        console.error(error);
    }
};

/*
DEPRECATED FUNCTION
i made it then i realized it's useless
given the response to overpass request, returns a list of LatLng objects containing the node of the route
*/
const extractCoordinates = (data: any): LatLng[] => {
    if (!data || !data.routes || !data.routes[0] || !data.routes[0].geometry || !data.routes[0].geometry.coordinates) {
        return [];
    }

    const coordinates = data.routes[0].geometry.coordinates;
    return coordinates.map((coord: [number, number]) => ({
        latitude: coord[1],
        longitude: coord[0],
    }));
};


/*
given starting point and ending point, 
returns a list of LatLng objects of the route fetched by overpass from start point to end point
*/
export async function getRouteNodes(startLat: number, startLng: number, endLat: number, endLng: number): Promise<LatLng[]> {
    const routeFetched = await fetchRoute(startLat, startLng, endLat, endLng)
    return routeFetched
}


/*
takes in input two points on the map, latitude and longitude
returns a distance between the points in meters
*/
function haversineDistance(point1: LatLng, point2: LatLng): number {
    const R = 6371e3; // Raggio della Terra in metri

    const lat1 = point1.latitude * Math.PI / 180; // conversione in radianti
    const lat2 = point2.latitude * Math.PI / 180;
    const deltaLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const deltaLon = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // distanza in metri
    return distance;
}

/*
takes in input two arrays: one containing the nodes of a path, and one containing POIs, and a maximum distance
returns an array of pairs, a node and a POI, matched to be the smallest distance pair of the arrays
*/
export function matchPOIsToNodes(
    POIs: LatLng[], 
    mapNodes: LatLng[], 
    maxDistance: number = 100
): { node: LatLng, POI: LatLng }[] {
    const result: { node: LatLng, POI: LatLng }[] = [];

    // Iteriamo su una copia dell'array dei punti d'interesse, così possiamo rimuovere elementi
    const POIsCopy = [...POIs];

    // Finché ci sono punti d'interesse da processare
    while (POIsCopy.length > 0) {
        let pointAssigned = false;

        for (let i = 0; i < POIsCopy.length; i++) {
            const POI = POIsCopy[i];

            let closestNode: LatLng | null = null;
            let minDistance = Infinity;
            let closestNodeIndex = -1;

            // Trova il nodo più vicino che sia sotto la distanza massima
            mapNodes.forEach((node, index) => {
                const distance = haversineDistance(POI, node);
                if (distance < minDistance && distance <= maxDistance) {
                    minDistance = distance;
                    closestNode = node;
                    closestNodeIndex = index;
                }
            });

            // Se troviamo un nodo valido entro la distanza massima, lo accoppiamo
            if (closestNode) {
                result.push({ node: closestNode, POI });

                // Rimuoviamo il nodo e il punto d'interesse
                mapNodes.splice(closestNodeIndex, 1);
                POIsCopy.splice(i, 1);

                pointAssigned = true;
                break; // Abbiamo accoppiato questo punto, passiamo al prossimo
            }
        }

        // Se nessun punto è stato assegnato in questo ciclo, significa che nessun nodo è entro maxDistance
        if (!pointAssigned) {
            break; // Nessuna accoppiata possibile, esci dal ciclo
        }
    }

    return result;
}