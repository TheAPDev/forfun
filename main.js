(function () {
  "use strict";

  /* Set this to your form backend (e.g. a Supabase Edge Function or Formspree URL) before going live. */
  var EARLY_ACCESS_ENDPOINT = "";

  /* ---------- A day at the door ---------- */
  var EVENTS = [
    { t: "07:05", who: "Milk delivery", score: 3, signals: ["Arrives every day between 6:50 and 7:20", "Stayed under 30 seconds", "Left the packet and walked away"], verdict: "Matches your routine. No notification sent.", level: "low" },
    { t: "09:40", who: "Meera, house help", score: 6, signals: ["Familiar face", "Domestic help profile, expected 9:30 to 10:00", "Rang the bell and was let in"], verdict: "Arrival logged quietly in Family Safety Mode.", level: "low" },
    { t: "13:32", who: "Courier, parcel left", score: 14, signals: ["Not a familiar face", "Carrying a parcel, left it at the door", "Stayed 40 seconds"], verdict: "Parcel alert sent. Clip saved.", level: "low" },
    { t: "15:48", who: "Aarav, home from school", score: 4, signals: ["Familiar face", "Child profile, expected by 4:00", "Unlocked the door and went in"], verdict: "“Aarav is home” sent to both parents.", level: "low" },
    { t: "16:21", who: "Unrecognised person", score: 82, signals: ["Not a familiar face", "Stayed 3 min 40 s without ringing", "Went to the window twice", "Tried the door handle"], verdict: "Priority alert sent. Evidence clip saved with timestamps.", level: "high" },
    { t: "19:10", who: "Rohan, family", score: 2, signals: ["Familiar face", "Usual time home from work"], verdict: "Matches your routine. No notification sent.", level: "low" }
  ];
  var COLORS = { low: "var(--ok)", mid: "var(--warn)", high: "var(--alert)" };

  var list = document.querySelector(".day-list");
  if (list) {
    var buttons = Array.prototype.slice.call(list.querySelectorAll(".ev"));
    var gFill = document.getElementById("g-fill");
    var gNum = document.getElementById("g-num");
    var dTime = document.getElementById("d-time");
    var dTitle = document.getElementById("d-title");
    var dSignals = document.getElementById("d-signals");
    var dVerdict = document.getElementById("d-verdict");

    var select = function (i, focus) {
      var e = EVENTS[i];
      buttons.forEach(function (b, j) {
        b.setAttribute("aria-selected", j === i ? "true" : "false");
        b.tabIndex = j === i ? 0 : -1;
      });
      if (focus) buttons[i].focus();
      gFill.style.strokeDashoffset = String(100 - e.score);
      gFill.style.stroke = COLORS[e.level];
      gNum.textContent = String(e.score);
      dTime.textContent = e.t + " · Front door";
      dTitle.textContent = e.who;
      dSignals.textContent = "";
      e.signals.forEach(function (s) {
        var li = document.createElement("li");
        li.textContent = s;
        dSignals.appendChild(li);
      });
      dVerdict.textContent = e.verdict;
      dVerdict.className = "verdict v-" + e.level;
    };

    list.removeAttribute("tabindex");
    buttons.forEach(function (b, i) {
      b.type = "button";
      b.addEventListener("click", function () { select(i, false); });
      b.addEventListener("keydown", function (ev) {
        var n = null;
        if (ev.key === "ArrowDown" || ev.key === "ArrowRight") n = (i + 1) % buttons.length;
        if (ev.key === "ArrowUp" || ev.key === "ArrowLeft") n = (i - 1 + buttons.length) % buttons.length;
        if (ev.key === "Home") n = 0;
        if (ev.key === "End") n = buttons.length - 1;
        if (n !== null) { ev.preventDefault(); select(n, true); }
      });
    });
    select(4, false);
  }

  /* ---------- Visitor summary language ---------- */
  var SUMMARY = {
    en: { title: "Today at your door", body: "3 familiar visitors, 1 parcel delivery and 1 unrecognised person at 4:21 PM. Aarav was home by 3:48 PM.", lang: "en-IN" },
    hi: { title: "आज आपके दरवाज़े पर", body: "3 जाने-पहचाने लोग, 1 पार्सल डिलीवरी, और शाम 4:21 बजे 1 अनजान व्यक्ति। आरव दोपहर 3:48 बजे तक घर पहुँच गया था।", lang: "hi" }
  };
  var langBtns = Array.prototype.slice.call(document.querySelectorAll(".lang-btn"));
  var notif = document.querySelector(".notif");
  langBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var s = SUMMARY[b.getAttribute("data-lang")];
      langBtns.forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
      document.getElementById("sum-title").textContent = s.title;
      document.getElementById("sum-body").textContent = s.body;
      notif.setAttribute("lang", s.lang);
      notif.classList.toggle("hi", s.lang === "hi");
    });
  });

  /* ---------- Early access form ---------- */
  var form = document.getElementById("ea-form");
  if (form) {
    var msg = document.getElementById("ea-msg");
    var submit = document.getElementById("ea-submit");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var setMsg = function (text, isErr) { msg.textContent = text; msg.classList.toggle("err", !!isErr); };

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = form.elements.name, email = form.elements.email;
      name.removeAttribute("aria-invalid"); email.removeAttribute("aria-invalid");
      if (form.elements.website.value) return; /* bot trap */
      if (!name.value.trim()) { name.setAttribute("aria-invalid", "true"); name.focus(); setMsg("Please enter your name.", true); return; }
      if (!emailRe.test(email.value.trim())) { email.setAttribute("aria-invalid", "true"); email.focus(); setMsg("Please enter a valid email address, like priya@example.com.", true); return; }

      if (!EARLY_ACCESS_ENDPOINT) {
        setMsg("Early-access sign-ups open shortly. Please write to hello@homeeni.com in the meantime.", true);
        return;
      }
      var payload = {
        name: name.value.trim().slice(0, 80),
        email: email.value.trim().slice(0, 120),
        city: form.elements.city.value.trim().slice(0, 60),
        home: form.elements.home.value
      };
      submit.disabled = true;
      setMsg("Adding you to the list…", false);
      fetch(EARLY_ACCESS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
        credentials: "omit"
      }).then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        form.reset();
        setMsg("You're on the list, " + payload.name.split(" ")[0] + ". We'll email you before DoorCam opens for orders.", false);
      }).catch(function () {
        setMsg("We couldn't add you just now. Check your connection and try again.", true);
      }).then(function () { submit.disabled = false; });
    });
  }
})();
