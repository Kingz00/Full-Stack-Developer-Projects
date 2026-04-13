import { words } from "./words";

const getRandomIndex = <T>(array: Array<T>): number => {
    return Math.floor(Math.random() * array.length)
}

export const getRandomWord = (): Array<string> => {
    const randomWordIndex: number = getRandomIndex<string>(words)
    return words[randomWordIndex].split("")
}

export function getFarewellText(language: string): string {
    const options: Array<string> = [
        `Farewell, ${language}`,
        `Adios, ${language}`,
        `R.I.P., ${language}`,
        `We'll miss you, ${language}`,
        `Oh no, not ${language}!`,
        `${language} bites the dust`,
        `Gone but not forgotten, ${language}`,
        `The end of ${language} as we know it`,
        `Off into the sunset, ${language}`,
        `${language}, it's been real`,
        `${language}, your watch has ended`,
        `${language} has left the building`
    ];

    const randomIndex: number = getRandomIndex<string>(options);
    return options[randomIndex];
}