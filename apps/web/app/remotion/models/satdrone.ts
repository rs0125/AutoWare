export interface satdroneModel {
    dronevideourl?: string;
    satimageurl?: string;
    latitude: number;
    longitude: number;
    audio?: {
        audioUrl?: string;
        durationInSeconds: number;
        transcript: string;
    };
    startPaddingInSeconds?: number;
}