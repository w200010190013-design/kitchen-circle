// Static port of app/footer-background.tsx (identical logic, no React).
// gazeFrames is provided by gaze-frames.js, generated from app/gaze-frames.json.
(function () {
  var TAU = Math.PI * 2;
  var wrappedAngle = function (angle) { return (angle % TAU + TAU) % TAU; };

  // These angles were measured from the actual pupil positions in the clip's
  // first complete orbit. Match direction, rather than assuming constant speed.
  function timeForAngle(angle) {
    var target = wrappedAngle(angle);
    var nearestTime = gazeFrames[0][1];
    var nearestDistance = Infinity;
    for (var i = 0; i < gazeFrames.length; i++) {
      var sampleAngle = gazeFrames[i][0];
      var time = gazeFrames[i][1];
      var difference = Math.abs(target - sampleAngle);
      var distance = Math.min(difference, TAU - difference);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestTime = time;
      }
    }
    return nearestTime + 1 / 240;
  }

  var video = document.querySelector('.footer-background video');
  if (!video) return;
  var frame = 0;
  var desiredTime = 0;
  var pointer = null;
  var disposed = false;
  var mobile = window.matchMedia('(max-width: 700px)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var seek = function () {
    frame = 0;
    if (disposed || mobile.matches || video.readyState < 2 || video.seeking) return;
    if (Math.abs(video.currentTime - desiredTime) > 1 / 48) {
      video.currentTime = Math.min(desiredTime, video.duration - 1 / 24);
    }
  };
  var schedule = function () {
    if (!frame) frame = requestAnimationFrame(seek);
  };
  var updateTarget = function () {
    if (mobile.matches || !pointer) return;
    var rect = video.getBoundingClientRect();
    var scale = Math.max(rect.width / 1920, rect.height / 1080);
    // Match the exact object-fit: cover positioning, including mobile crops.
    var eyeX = rect.left + rect.width / 2 + (948 - 960) * scale;
    var eyeY = rect.top + rect.height / 2 + (418 - 540) * scale;
    var dx = pointer.x - eyeX;
    var dy = pointer.y - eyeY;
    // Avoid unstable angles directly between the eyes.
    if (Math.hypot(dx, dy) > 8) {
      desiredTime = timeForAngle(Math.atan2(dy, dx));
      schedule();
    }
  };
  var move = function (event) {
    pointer = { x: event.clientX, y: event.clientY };
    updateTarget();
  };
  var ready = function () {
    video.loop = mobile.matches;
    if (mobile.matches && !reducedMotion.matches) {
      var playing = video.play();
      if (playing && playing.catch) playing.catch(function () { /* Keep the first frame if autoplay is unavailable. */ });
    } else {
      video.pause();
      if (!mobile.matches) { updateTarget(); schedule(); }
    }
  };
  // Coalesce fast pointer movements while a frame is decoding. When it
  // finishes, seek immediately to the latest requested gaze direction.
  video.addEventListener('seeked', schedule);
  video.addEventListener('loadeddata', ready);
  mobile.addEventListener('change', ready);
  reducedMotion.addEventListener('change', ready);
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('resize', updateTarget);
  window.addEventListener('scroll', updateTarget, { passive: true });
  if (video.readyState >= 2) ready();

  // Mirror of the React cleanup, run when the page is torn down.
  window.addEventListener('pagehide', function () {
    disposed = true;
    cancelAnimationFrame(frame);
    video.removeEventListener('seeked', schedule);
    video.removeEventListener('loadeddata', ready);
    mobile.removeEventListener('change', ready);
    reducedMotion.removeEventListener('change', ready);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('resize', updateTarget);
    window.removeEventListener('scroll', updateTarget);
  }, { once: true });

  // Exposed for the cardinal-direction check only.
  window.__timeForAngle = timeForAngle;
})();
