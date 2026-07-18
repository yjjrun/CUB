import { useEffect, useRef, useState } from "react";
import { SAMPLE_DOG, analyzeDogImage, loadScanHistory, saveScanHistory } from "../../lib/care.js";

// Scan phases: idle -> requesting -> live -> captured -> analyzing -> result
// plus terminal error phases: denied, unavailable.

export default function EmotionScan() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [phase, setPhase] = useState("idle");
  const [capturedUrl, setCapturedUrl] = useState("");
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(loadScanHistory);
  const [savedNote, setSavedNote] = useState(false);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // Always release the camera when leaving the scanner.
  useEffect(() => stopCamera, []);
  useEffect(() => () => { if (capturedUrl) URL.revokeObjectURL(capturedUrl); }, [capturedUrl]);

  const startCamera = async () => {
    setResult(null);
    setSavedNote(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setPhase("unavailable");
      return;
    }
    setPhase("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setPhase("live");
      // The <video> renders on the next tick once phase is "live".
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch (error) {
      setPhase(error?.name === "NotAllowedError" ? "denied" : "unavailable");
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setCapturedBlob(blob);
      setCapturedUrl(URL.createObjectURL(blob));
      stopCamera();
      setPhase("captured");
    }, "image/jpeg", 0.9);
  };

  const onUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    stopCamera();
    setResult(null);
    setSavedNote(false);
    setCapturedBlob(file);
    setCapturedUrl(URL.createObjectURL(file));
    setPhase("captured");
  };

  const analyze = async () => {
    if (!capturedBlob) return;
    setPhase("analyzing");
    const outcome = await analyzeDogImage(capturedBlob);
    setResult(outcome);
    setPhase("result");
  };

  const retake = () => {
    setCapturedBlob(null);
    setCapturedUrl("");
    setResult(null);
    setSavedNote(false);
    startCamera();
  };

  const reset = () => {
    stopCamera();
    setCapturedBlob(null);
    setCapturedUrl("");
    setResult(null);
    setSavedNote(false);
    setPhase("idle");
  };

  const saveObservation = () => {
    const entry = {
      id: `scan-${Date.now()}`,
      date: new Date().toISOString(),
      mood: result.mood,
      confidence: result.confidence,
    };
    const next = [entry, ...history];
    setHistory(next);
    saveScanHistory(next);
    setSavedNote(true);
  };

  return (
    <div className="care-scan">
      <section className="panel care-scan-panel" aria-label="Emotion scan">
        <div className="panel-head compact">
          <p className="eyebrow">Emotion Scan</p>
          <h1>How is {SAMPLE_DOG.name} feeling?</h1>
          <p className="helper-copy">
            Point your camera at {SAMPLE_DOG.name} or upload a photo. This prototype demonstrates
            the experience with simulated analysis — it does not diagnose emotions or health.
          </p>
        </div>

        <div className="care-scan-stage" data-phase={phase}>
          {phase === "idle" && (
            <div className="care-scan-empty">
              <img src={SAMPLE_DOG.photo} alt="" aria-hidden="true" />
              <p>Start the camera or upload a photo of {SAMPLE_DOG.name}.</p>
            </div>
          )}

          {phase === "requesting" && (
            <div className="care-scan-empty">
              <div className="care-spinner" aria-hidden="true" />
              <p>Waiting for camera permission…</p>
              <p className="helper-copy">Your browser will ask to use the camera. Nothing is uploaded.</p>
            </div>
          )}

          {phase === "denied" && (
            <div className="care-scan-empty care-scan-error" role="alert">
              <span aria-hidden="true">🚫</span>
              <p>Camera permission was denied.</p>
              <p className="helper-copy">
                You can re-enable the camera in your browser's site settings, or upload a photo instead.
              </p>
            </div>
          )}

          {phase === "unavailable" && (
            <div className="care-scan-empty care-scan-error" role="alert">
              <span aria-hidden="true">📷</span>
              <p>No camera available on this device.</p>
              <p className="helper-copy">Upload a photo instead — the scan works the same way.</p>
            </div>
          )}

          {phase === "live" && (
            /* eslint-disable-next-line jsx-a11y/media-has-caption */
            <video ref={videoRef} className="care-scan-video" playsInline muted />
          )}

          {(phase === "captured" || phase === "analyzing" || phase === "result") && capturedUrl && (
            <div className="care-scan-frame">
              <img src={capturedUrl} alt={`Captured photo of ${SAMPLE_DOG.name}`} />
              {phase === "analyzing" && (
                <div className="care-scan-overlay" role="status" aria-label="Analysis in progress">
                  <div className="care-scan-beam" aria-hidden="true" />
                  <p>Reading body language…</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="care-scan-actions">
          {(phase === "idle" || phase === "denied" || phase === "unavailable") && (
            <>
              <button className="primary-action" type="button" onClick={startCamera}>
                {phase === "idle" ? "📷 Start camera" : "Try camera again"}
              </button>
              <button className="ghost-action" type="button" onClick={() => fileInputRef.current?.click()}>
                Upload a photo
              </button>
            </>
          )}
          {phase === "live" && (
            <>
              <button className="primary-action" type="button" onClick={capture}>Capture</button>
              <button className="ghost-action" type="button" onClick={reset}>Cancel</button>
            </>
          )}
          {phase === "captured" && (
            <>
              <button className="primary-action" type="button" onClick={analyze}>Analyse this photo</button>
              <button className="ghost-action" type="button" onClick={retake}>Retake</button>
            </>
          )}
          {phase === "result" && (
            <button className="ghost-action" type="button" onClick={reset}>New scan</button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="visually-hidden"
            aria-label="Upload a photo for the emotion scan"
            onChange={onUpload}
          />
        </div>
      </section>

      {phase === "result" && result && (
        <section className="panel care-scan-result" aria-label="Scan result">
          <div className="care-result-head">
            <span className={`care-mood-chip mood-${result.mood.toLowerCase()}`}>{result.mood}</span>
            <span className="care-confidence">
              {result.confidence === "uncertain" ? "Confidence: uncertain" : `Confidence: ${result.confidence}`}
            </span>
          </div>
          <p className="care-result-explainer">{result.explanation}</p>
          <div className="care-result-cols">
            <div>
              <h3>Signals CUB noticed</h3>
              <ul>
                {result.signals.map((signal) => <li key={signal}>{signal}</li>)}
              </ul>
            </div>
            <div>
              <h3>Suggested next steps</h3>
              <ul>
                {result.steps.map((step) => <li key={step}>{step}</li>)}
              </ul>
            </div>
          </div>
          {result.vetFlag && (
            <p className="notice error care-vet-warning" role="alert">
              ⚠ Some of these signals can accompany physical discomfort. If they persist or
              you notice limping, guarding, or appetite changes, please consult a veterinarian.
            </p>
          )}
          <div className="care-result-actions">
            <button className="primary-action" type="button" onClick={saveObservation} disabled={savedNote}>
              {savedNote ? "Saved to care history ✓" : "Save to care history"}
            </button>
          </div>
          <p className="helper-copy">
            Demo analysis only — CUB suggests possibilities from visible body language and can be wrong.
            It is not a substitute for a veterinarian or behaviourist.
          </p>
        </section>
      )}

      {history.length > 0 && (
        <section className="panel care-scan-history" aria-label="Saved observations">
          <div className="panel-head compact">
            <p className="eyebrow">Care history</p>
            <h2>Saved observations</h2>
          </div>
          <ul>
            {history.slice(0, 6).map((entry) => (
              <li key={entry.id}>
                <span className={`care-mood-chip mood-${entry.mood.toLowerCase()}`}>{entry.mood}</span>
                <span>{new Date(entry.date).toLocaleString("en-SG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
