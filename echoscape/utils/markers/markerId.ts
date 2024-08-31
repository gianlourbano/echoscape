

/*
    given a marker id returns its type 
    example: markerId = example marker-audio:4132 returns "audio"
*/

export function getMarkerType(markerId: string): string | null {
    if (!markerId || typeof markerId !== 'string') return null;
    const parts = markerId.split("marker-");
    if (parts.length < 2) return null;
    return parts[1].split(":")[0];
}

export function getMarkerNumber(markerId: string): number | null {
    if (!markerId || typeof markerId !== 'string') return null;
    const parts = markerId.split(":");
    if (parts.length < 2) return null;
    const number = Number(parts[1]);
    return isNaN(number) ? null : number;
}