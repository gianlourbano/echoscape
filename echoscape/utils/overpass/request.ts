


/*
https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide

Bounding box clauses always start with the lowest latitude (southernmost) followed by lowest longitude (westernmost), then highest latitude (northernmost) then highest longitude (easternmost). Note that this is different from the ordering in the XAPI syntax. 
*/
export async function sendOverpassRequest(
    bbox: 
        {minLat: number, minLon: number, maxLat: number, maxLon: number},
    timeout: number = 10,
    ) {

    console.info("richiesta a overpass")
    var result = await fetch(
        process.env.EXPO_PUBLIC_OVERPASS_API_URL,
        {
            method: "POST",
            // The body contains the query
            // to understand the query language see "The Programmatic Query Language" on
            // https://wiki.openstreetmap.org/wiki/Overpass_API#The_Programmatic_Query_Language_(OverpassQL)
            body: "data="+ encodeURIComponent(`
                [bbox:${bbox.minLat},${bbox.minLon},${bbox.maxLat},${bbox.maxLon}]
                [out:json]
                [timeout:${timeout}]
                ;
                
                    node
                    ["historic"~"."]
                    ["name"];
                    
                
                out geom;
            `)
        },
    ).then(
        (data)=>data.json()
    )

    //console.info("risposta di overpass: ", result.elements)

    //console.log("DEBUG OVERPASS: ", result)

    return result.elements
}

