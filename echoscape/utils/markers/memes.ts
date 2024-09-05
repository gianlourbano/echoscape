import { coordsToGeoJSONFeature } from "./utils";

const generateMeme = ({
    latitude,
    longitude,
    title,
    icon,
}: {
    latitude: number;
    longitude: number;
    title: string;
    icon: string;
}) => {
    return coordsToGeoJSONFeature([longitude, latitude], {
        icon,
        name: title,
        id: `special-${title.toLowerCase().replace(/\s/g, "-")}`,
        type: "special",
    });
};

export const memes_ = [
    {
        latitude: 44.49438,
        longitude: 11.363488,

        title: "Casa del Patron",
        icon: "language-haskell",
    },
    {
        latitude: 44.478343,
        longitude: 11.367605,

        title: "Casa dei Presi a Malissimo",
        icon: "matrix",
    },
    {
        title: "Re Barbaro",
        icon: "language-java",
        latitude: 44.493414,
        longitude: 11.386267,
    },
    {
        title: "Echoscape HQ",
        icon: "language-cpp",
        latitude: 44.502848,
        longitude: 11.350243,
    },
    {
        title: "Debian HQ",
        icon: "debian",
        latitude: 44.497362695161755,
        longitude: 11.355952358281575,
    },
    {
        title: "Piazza Verdi",
        icon: "hammer-sickle",
        latitude: 44.49615864222758,
        longitude: 11.35068148258396,
    },
    {
        title: "Presi a Male HQ",
        icon: "minecraft",
        latitude: 44.46686176299109,
        longitude: 11.373721990024828,
    },
];

export const memes = memes_.map((meme) => generateMeme(meme));

// state-machine
// raspberry-pi
// record-player
// radioactive
// minecraft
