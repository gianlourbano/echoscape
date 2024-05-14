

/*
    given a marker id returns its type 
    example: markerId = example marker-audio:4132 returns "audio"
*/

export function getMarkerType(markerId: string): string | null {
    if (!markerId) return null
    return markerId.split("marker-")[1].split(":")[0]
}


export function getMarkerNumber(markerId: string): number | null {
    if (!markerId) return null
    return Number(markerId.split(":")[1])
}