import {
  getRenderProgress,
  speculateFunctionName,
} from "@remotion/lambda/client";
import { ActionFunction } from "react-router";
import { errorAsJson } from "./lib/return-error-as-json";
import { ProgressRequest, ProgressResponse } from "./remotion/schemata";
import { DISK, RAM, REGION, TIMEOUT } from "./remotion/constants.mjs";

export const action: ActionFunction = errorAsJson(
  async ({ request }): Promise<ProgressResponse> => {
    const body = await request.json();
    const { bucketName, id } = ProgressRequest.parse(body);

    const renderProgress = await getRenderProgress({
      renderId: id,
      bucketName,
      functionName: speculateFunctionName({
        diskSizeInMb: DISK,
        memorySizeInMb: RAM,
        timeoutInSeconds: TIMEOUT,
      }),
      region: REGION,
    });
    
    // Log progress for debugging
    console.log(`Render progress: ${(renderProgress.overallProgress * 100).toFixed(1)}%`, {
      done: renderProgress.done,
      errors: renderProgress.errors?.length || 0,
      chunks: renderProgress.chunks,
      costs: renderProgress.costs,
      framesRendered: renderProgress.framesRendered,
      outputFile: renderProgress.outputFile,
    });
    
    // Check if render is stuck (same progress for too long)
    if (renderProgress.overallProgress > 0.85 && !renderProgress.done) {
      console.warn('Render may be stuck at', (renderProgress.overallProgress * 100).toFixed(1) + '%');
      console.warn('Chunks:', renderProgress.chunks);
      console.warn('Frames rendered:', renderProgress.framesRendered);
    }
    
    if (renderProgress.fatalErrorEncountered) {
      console.error('Fatal render error:', renderProgress.errors);
      return {
        type: "error",
        message: renderProgress.errors[0].message,
      };
    }

    // Check for non-fatal errors that might be causing issues
    if (renderProgress.errors && renderProgress.errors.length > 0) {
      console.warn('Render errors (non-fatal):', renderProgress.errors);
    }

    if (renderProgress.done) {
      console.log('Render complete!', {
        outputFile: renderProgress.outputFile,
        size: renderProgress.outputSizeInBytes,
      });
      return {
        type: "done",
        url: renderProgress.outputFile as string,
        size: renderProgress.outputSizeInBytes as number,
      };
    }

    return {
      type: "progress",
      progress: Math.max(0.03, renderProgress.overallProgress),
    };
  },
);
