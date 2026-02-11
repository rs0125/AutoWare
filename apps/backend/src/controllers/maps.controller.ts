import { Request, Response } from 'express';
import { generateSatelliteImageFromUrl, generateSatelliteImage } from '../services/maps.service';
import { updateMediaUrls } from '../services/composition.service';
import { z } from 'zod';

const GenerateSatelliteImageSchema = z.object({
  compositionId: z.string().uuid(),
  googleMapsUrl: z.string().url().optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  options: z
    .object({
      zoom: z.number().min(1).max(22).optional(),
      width: z.number().min(100).max(1920).optional(),
      height: z.number().min(100).max(1920).optional(),
      style: z.enum(['satellite-streets-v12', 'satellite-v9', 'streets-v12']).optional(),
    })
    .optional(),
  updateComposition: z.boolean().optional().default(true),
  fieldPath: z.string().optional().default('satDroneSection.satelliteImageUrl'),
});

export const generateSatelliteImageHandler = async (req: Request, res: Response) => {
  try {
    const validationResult = GenerateSatelliteImageSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const {
      compositionId,
      googleMapsUrl,
      coordinates,
      options,
      updateComposition,
      fieldPath,
    } = validationResult.data;

    // Must provide either googleMapsUrl or coordinates
    if (!googleMapsUrl && !coordinates) {
      return res.status(400).json({
        error: 'Must provide either googleMapsUrl or coordinates',
      });
    }

    let result;

    if (googleMapsUrl) {
      result = await generateSatelliteImageFromUrl(compositionId, googleMapsUrl, options);
    } else if (coordinates) {
      result = await generateSatelliteImage(compositionId, coordinates, options);
    }

    // Update composition if requested
    if (updateComposition && result) {
      const urlMappings: Record<string, any> = {
        [fieldPath]: result.imageUrl,
      };

      // Also update the location coordinates if not already set
      const locationPath = fieldPath.replace('.satelliteImageUrl', '.location');
      urlMappings[locationPath] = result.coordinates;

      await updateMediaUrls(compositionId, urlMappings);
    }

    res.status(200).json({
      success: true,
      imageUrl: result!.imageUrl,
      key: result!.key,
      coordinates: result!.coordinates,
      compositionUpdated: updateComposition,
    });
  } catch (error: any) {
    console.error('Error generating satellite image:', error);

    if (error.message.includes('Could not extract coordinates')) {
      return res.status(400).json({ error: error.message });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Composition not found' });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};
