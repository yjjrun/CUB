// On-device subject detection for the Emotion Scan, built on TensorFlow.js
// COCO-SSD. Everything runs in the browser — no image ever leaves the device.
// The model (~4MB) is lazy-loaded on the first scan only; callers should
// handle a load failure by falling back to demo behaviour.

let modelPromise = null;

function loadModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const [tf, cocoSsd] = await Promise.all([
        import("@tensorflow/tfjs"),
        import("@tensorflow-models/coco-ssd"),
      ]);
      await tf.ready();
      return cocoSsd.load({ base: "lite_mobilenet_v2" });
    })();
    // A failed load (e.g. offline) shouldn't poison every later attempt.
    modelPromise.catch(() => { modelPromise = null; });
  }
  return modelPromise;
}

async function blobToImage(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return image;
  } finally {
    // decode() has resolved with pixels in memory; the URL can go.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

const OTHER_ANIMALS = new Set(["cat", "bird", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe"]);

// Returns { dog, person, otherAnimal, imageWidth, imageHeight } where each
// subject is the highest-scoring detection of that kind (or null), with
// bbox = [x, y, width, height] in pixels.
export async function detectSubjects(blob) {
  const model = await loadModel();
  const image = await blobToImage(blob);
  const predictions = await model.detect(image, 10, 0.45);

  const best = (filter) => predictions
    .filter(filter)
    .sort((a, b) => b.score - a.score)[0] || null;

  return {
    dog: best((p) => p.class === "dog"),
    person: best((p) => p.class === "person"),
    otherAnimal: best((p) => OTHER_ANIMALS.has(p.class)),
    imageWidth: image.naturalWidth,
    imageHeight: image.naturalHeight,
  };
}

// Rough framing analysis for a detected dog: how much of the frame it fills
// and whether its bounding box is cut off at the image edges. A box cropped
// at the frame borders (other than the bottom, where legs commonly meet the
// ground/photo edge) usually means part of the body — often the tail or rear
// — is outside the photo.
export function assessDogFraming(dog, imageWidth, imageHeight) {
  const [x, y, w, h] = dog.bbox;
  const coverage = (w * h) / (imageWidth * imageHeight);
  const margin = 0.02;
  const cutLeft = x <= imageWidth * margin;
  const cutRight = x + w >= imageWidth * (1 - margin);
  const cutTop = y <= imageHeight * margin;
  const sidesCut = [cutLeft, cutRight, cutTop].filter(Boolean).length;
  // Extreme close-ups (face filling the frame) also hide most of the body.
  const partial = sidesCut > 0 || coverage > 0.82;
  return { coverage, partial, score: dog.score };
}
