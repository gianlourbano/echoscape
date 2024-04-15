/*
questo file serve a dire al compilatore typescript di considerare i file audio come stringhe
in particolare un file audio è rappresentato come la stringa per il suo percorso
di base si possono importare solo moduli (codice)
*/


declare module "*.wav" {
    const src: string;
    export default src;
}


declare module "*.mp3" {
    const src: string;
    export default src;
}

declare module "*.m4a" {
    const src: string;
    export default src;
}