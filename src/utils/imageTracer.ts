// @ts-ignore
import ImageTracer from 'imagetracerjs';

export const convertImageToSVG = (imageDataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // ImageTracer.imageToSVG(url, callback, options)
      ImageTracer.imageToSVG(
        imageDataUrl,
        (svgString: string) => {
          resolve(svgString);
        },
        {
          // Options for a cleaner vector look
          ltres: 1,
          qtres: 1,
          pathomit: 8,
          colorsampling: 1,
          numberofcolors: 16,
          mincolorratio: 0,
          colorquantcycles: 3,
          blurradius: 0,
          blurdelta: 20
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};
