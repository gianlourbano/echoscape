const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.post("/upload", (req, res) => {
    // grab Bearer token from request header
    const token = req.headers.authorization.split(" ")[1];
    // check if token is valid
    // always valid cmon

    if (!token) {
        res.status(401).json({ detail: "Not authenticated" });
    }

    // check if file is in request
    if (!req.files) {
        res.status(400).json({ detail: "No file uploaded" });
    }

    // check that file is of type audio/mpeg
    const file = req.files.file;

    if (file.mimetype !== "audio/mpeg") {
        res.status(415).json({ detail: "File is not a supported audio file." });
    }

    // check that file is not too large (2MB)
    if (file.size > 2 * 1024 * 1024) {
        res.status(413).json({ detail: "File is larger than 2 megabytes." });
    }

    // all good! send back mock info
    res.status(200).json({
        bpm: 106,
        danceability: 1.4463435411453247,
        loudness: 379.0638732910156,
        mood: {
            action: 0.01428570132702589,
            adventure: 0.018422428518533707,
            advertising: 0.014455151744186878,
            background: 0.015055591240525246,
            ballad: 0.023780014365911484,
            calm: 0.007069522049278021,
            children: 0.009411792270839214,
            christmas: 0.03888391703367233,
            commercial: 0.009270496666431427,
            cool: 0.02042141743004322,
            corporate: 0.01459012646228075,
            dark: 0.03070065937936306,
            deep: 0.026069145649671555,
            documentary: 0.013184783048927784,
            drama: 0.013627526350319386,
            dramatic: 0.0062042162753641605,
            dream: 0.012943880632519722,
            emotional: 0.015615768730640411,
            energetic: 0.14437386393547058,
            epic: 0.012447888031601906,
            fast: 0.008052756078541279,
            film: 0.04736435413360596,
            fun: 0.03613147884607315,
            funny: 0.04460654780268669,
            game: 0.0071920305490493774,
            groovy: 0.01242945808917284,
            happy: 0.07764209806919098,
            heavy: 0.0030407116282731295,
            holiday: 0.015988267958164215,
            hopeful: 0.00817897729575634,
            inspiring: 0.021754665300250053,
            love: 0.12741945683956146,
            meditative: 0.012767409905791283,
            melancholic: 0.014995778910815716,
            melodic: 0.052028100937604904,
            motivational: 0.016308220103383064,
            movie: 0.014395803213119507,
            nature: 0.005963687784969807,
            party: 0.02031608670949936,
            positive: 0.018567675724625587,
            powerful: 0.0032185553573071957,
            relaxing: 0.01534408051520586,
            retro: 0.006974226329475641,
            romantic: 0.022847231477499008,
            sad: 0.022498276084661484,
            sexy: 0.008236495777964592,
            slow: 0.016653327271342278,
            soft: 0.011695712804794312,
            soundscape: 0.005284064915031195,
            space: 0.007164293434470892,
            sport: 0.014181585982441902,
            summer: 0.025207947939634323,
            trailer: 0.0030946775805205107,
            travel: 0.0056702434085309505,
            upbeat: 0.03310861065983772,
            uplifting: 0.014832654967904091,
        },
        genre: {
            "60s": 0.002873250748962164,
            "70s": 0.0018179953331127763,
            "80s": 0.0019117072224617004,
            "90s": 0.009133872576057911,
            acidjazz: 0.0009577646851539612,
            alternative: 0.019823767244815826,
            alternativerock: 0.002520565642043948,
            ambient: 0.008732164278626442,
            atmospheric: 0.0027410550974309444,
            blues: 0.016552908346056938,
            bluesrock: 0.0010288521880283952,
            bossanova: 0.0013466954696923494,
            breakbeat: 0.003794293152168393,
            celtic: 0.004373228643089533,
            chanson: 0.006455364637076855,
            chillout: 0.010099572129547596,
            choir: 0.0021115094423294067,
            classical: 0.02049512416124344,
            classicrock: 0.004048742353916168,
            club: 0.00803200900554657,
            contemporary: 0.0019375011324882507,
            country: 0.008387772366404533,
            dance: 0.012700480408966541,
            darkambient: 0.0007989659789018333,
            darkwave: 0.0008973196381703019,
            deephouse: 0.0015354156494140625,
            disco: 0.002999375807121396,
            downtempo: 0.005925728473812342,
            drumnbass: 0.003324456512928009,
            dub: 0.009116803295910358,
            dubstep: 0.0035876811016350985,
            easylistening: 0.008943125605583191,
            edm: 0.0015695721376687288,
            electronic: 0.047645896673202515,
            electronica: 0.0012676656479015946,
            electropop: 0.013499272055923939,
            ethno: 0.0028545274399220943,
            eurodance: 0.0018181741470471025,
            experimental: 0.01613645628094673,
            folk: 0.020799240097403526,
            funk: 0.015239141881465912,
            fusion: 0.003787220921367407,
            groove: 0.00526669155806303,
            grunge: 0.001811711466871202,
            hard: 0.0028643086552619934,
            hardrock: 0.0022177353966981173,
            hiphop: 0.6820124983787537,
            house: 0.005800244398415089,
            idm: 0.0012309864396229386,
            improvisation: 0.0009866490727290511,
            indie: 0.016680175438523293,
            industrial: 0.00230042333714664,
            instrumentalpop: 0.003421901259571314,
            instrumentalrock: 0.0030477955006062984,
            jazz: 0.011752525344491005,
            jazzfusion: 0.0009796351660043001,
            latin: 0.012376626022160053,
            lounge: 0.005730630364269018,
            medieval: 0.0010689839255064726,
            metal: 0.0029055760242044926,
            minimal: 0.001090656267479062,
            newage: 0.0024844645522534847,
            newwave: 0.0021560683380812407,
            orchestral: 0.009614108130335808,
            pop: 0.15591968595981598,
            popfolk: 0.03902918100357056,
            poprock: 0.03443172946572304,
            postrock: 0.0013698518741875887,
            progressive: 0.0038556321524083614,
            psychedelic: 0.0023867650888860226,
            punkrock: 0.006752033717930317,
            rap: 0.4831652045249939,
            reggae: 0.12625883519649506,
            rnb: 0.044571392238140106,
            rock: 0.056835073977708817,
            rocknroll: 0.0040036337450146675,
            singersongwriter: 0.010375802405178547,
            soul: 0.04294990748167038,
            soundtrack: 0.028076808899641037,
            swing: 0.004962789826095104,
            symphonic: 0.004029254429042339,
            synthpop: 0.0013566091656684875,
            techno: 0.003890915308147669,
            trance: 0.0016104370588436723,
            triphop: 0.020976489409804344,
            world: 0.024335350841283798,
            worldfusion: 0.0012128099333494902,
        },
        instrument: {
            accordion: 0.01502592395991087,
            acousticbassguitar: 0.021668288856744766,
            acousticguitar: 0.05145622417330742,
            bass: 0.3675084114074707,
            beat: 0.05787026882171631,
            bell: 0.01823015883564949,
            bongo: 0.015336135402321815,
            brass: 0.02531423605978489,
            cello: 0.01938530243933201,
            clarinet: 0.006401802413165569,
            classicalguitar: 0.021021712571382523,
            computer: 0.08011650294065475,
            doublebass: 0.010107140056788921,
            drummachine: 0.08700545132160187,
            drums: 0.3549068868160248,
            electricguitar: 0.23863232135772705,
            electricpiano: 0.032646872103214264,
            flute: 0.03354354575276375,
            guitar: 0.12244570255279541,
            harmonica: 0.022068610414862633,
            harp: 0.008992369286715984,
            horn: 0.007593621499836445,
            keyboard: 0.14293484389781952,
            oboe: 0.006065265741199255,
            orchestra: 0.020253878086805344,
            organ: 0.0073209526017308235,
            pad: 0.0034268484450876713,
            percussion: 0.040367402136325836,
            piano: 0.32667654752731323,
            pipeorgan: 0.01093822531402111,
            rhodes: 0.007739268243312836,
            sampler: 0.08182911574840546,
            saxophone: 0.07107989490032196,
            strings: 0.05040677264332771,
            synthesizer: 0.15011146664619446,
            trombone: 0.011336678639054298,
            trumpet: 0.02494839020073414,
            viola: 0.0080762580037117,
            violin: 0.03679962828755379,
            voice: 0.1406775712966919,
        },useFetch
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
