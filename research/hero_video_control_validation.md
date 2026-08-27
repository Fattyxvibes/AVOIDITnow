# Hero Video Control Validation

Date: 2026-08-22

The managed MP4 resolves successfully through its storage redirect with `video/mp4`, byte-range support, and a 53,885,161-byte content length. The component now invokes `HTMLMediaElement.play()` after making the active video muted, and retains native muted inline autoplay attributes. If a browser declines playback, the control switches to an explicit play state rather than leaving the video unavailable.

Desktop review confirmed that the compact play/pause control sits in the hero protocol panel. The panel uses a 28% dark glass layer with a soft backdrop blur, allowing the video’s mosque imagery to remain materially visible while retaining high-contrast text. Mobile review confirmed that the hero copy remains unobstructed and that the same control is present in the contained video-backed panel. Screenshot capture freezes video frames by design, so a frozen capture may display the play state even though the live component requests playback.
