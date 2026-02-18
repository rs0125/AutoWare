import { VERSION } from "remotion";

export const COMPOSITION_FPS = 30;
export const DURATION_IN_FRAMES = 120 * COMPOSITION_FPS; // Increased to 120 seconds to accommodate longer videos
export const COMPOSITION_WIDTH = 1920;
export const COMPOSITION_HEIGHT = 1080;
export const COMPOSITION_ID = "LogoAnimation";
export const RAM = 3008; // AWS Account Limit
export const DISK = 10240;
export const TIMEOUT = 900;
export const SITE_NAME = "remotion-react-router-example-" + VERSION;

/**
 * Use autocomplete to get a list of available regions.
 * @type {import('@remotion/lambda').AwsRegion}
 */
export const REGION = "ap-south-1"; // Mumbai
