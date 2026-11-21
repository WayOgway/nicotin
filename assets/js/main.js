/* =========================================================
   Владислав Сергеев — соматический практик
   Лендинг: освобождение от никотиновой зависимости
   ========================================================= */
(function () {
  "use strict";

  /* -------------------------------------------------------
     Ссылка для записи. Меняется в одном месте.
     ------------------------------------------------------- */
  var CONFIG = {
    telegram: "https://t.me/way_ogway",
    /* Номер счётчика Яндекс.Метрики. Пока null — цели не отправляются.
       Пример: metrikaId: 12345678 */
    metrikaId: null
  };

  function trackGoal(name) {
    if (!CONFIG.metrikaId || typeof window.ym !== "function") return;
    window.ym(CONFIG.metrikaId, "reachGoal", name);
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.getElementById("siteHeader");
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  var toTop = document.getElementById("toTop");
  var progress = document.getElementById("progress");

  /* ---------- Год ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Шапка, прогресс, кнопка «наверх» ---------- */
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;

      if (header) header.classList.toggle("scrolled", y > 12);
      if (toTop) toTop.classList.toggle("show", y > 700);
      if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";

      updateActive();
      ticking = false;
    });
  }

  /* ---------- Активный раздел в меню ---------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".nav a[href^='#'], .footer-nav a[href^='#']")
  );

  var sections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var el = document.getElementById(id);
    if (el && sections.indexOf(el) === -1) sections.push(el);
  });

  function updateActive() {
    if (!sections.length) return;

    var line = (header ? header.getBoundingClientRect().height : 0) + 48;
    var currentId = "";

    sections.forEach(function (sec) {
      if (sec.getBoundingClientRect().top <= line) currentId = sec.id;
    });

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      currentId = sections[sections.length - 1].id;
    }

    navLinks.forEach(function (link) {
      var isActive = link.getAttribute("href") === "#" + currentId;
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Мобильное меню ---------- */
  function closeMenu() {
    if (!nav || !nav.classList.contains("open")) return;
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
    document.body.classList.remove("menu-open");
  }

  function openMenu() {
    nav.classList.add("open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Закрыть меню");
    document.body.classList.add("menu-open");
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      if (nav.classList.contains("open")) closeMenu();
      else openMenu();
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) closeMenu();
    });
  }

  /* ---------- Наверх ---------- */
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Появление блоков ---------- */
  var revealItems = document.querySelectorAll(".reveal");

  function showReveal(el) {
    if (el) el.classList.add("is-visible");
  }

  /* При переходе по ссылке с # сразу показываем всю целевую секцию:
     высокие блоки (например, калькулятор) на маленьком экране могут не
     набрать нужный процент видимости и остаться невидимыми. */
  function revealHashTarget() {
    var id = (window.location.hash || "").slice(1);
    try { id = decodeURIComponent(id); } catch (err) { /* кривой % в ссылке */ }
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    showReveal(target);
    target.querySelectorAll(".reveal").forEach(showReveal);
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(showReveal);
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
          window.setTimeout(function () { showReveal(el); }, delay);
          revealObserver.unobserve(el);
        });
      },
      /* Порог 0: достаточно появления хотя бы части блока. Иначе длинный
         калькулятор не проявляется, когда по якорю прыгаешь на его секцию. */
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );
    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  revealHashTarget();
  window.addEventListener("hashchange", revealHashTarget);

  /* ---------- FAQ ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));

  faqItems.forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var answer = item.querySelector(".faq-a");
    if (!btn) return;

    if (answer) answer.setAttribute("aria-hidden", String(!item.classList.contains("open")));

    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");

      faqItems.forEach(function (other) {
        if (other === item || !other.classList.contains("open")) return;
        other.classList.remove("open");
        var otherBtn = other.querySelector(".faq-q");
        var otherAnswer = other.querySelector(".faq-a");
        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        if (otherAnswer) otherAnswer.setAttribute("aria-hidden", "true");
      });

      item.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
      if (answer) answer.setAttribute("aria-hidden", String(isOpen));
    });
  });

  /* ---------- Калькулятор стоимости ---------- */
  var priceInput = document.getElementById("price");
  var packsInput = document.getElementById("packs");
  var dailyInput = document.getElementById("daily");
  var priceOut = document.getElementById("priceOut");
  var packsOut = document.getElementById("packsOut");
  var dailyOut = document.getElementById("dailyOut");
  var sumSession = document.getElementById("sumSession");
  var sumDaily = document.getElementById("sumDaily");
  var sumYear = document.getElementById("sumYear");
  var hintDaily = document.getElementById("hintDaily");
  var messageText = document.getElementById("messageText");
  var copyMsg = document.getElementById("copyMsg");
  var sendBtn = document.getElementById("sendBtn");
  var sendNote = document.getElementById("sendNote");

  if (priceInput && packsInput && dailyInput && sumSession) {
    var DAYS = 30;
    var YEAR_DAYS = 365;
    var mode = "packs";

    var packFields = Array.prototype.slice.call(document.querySelectorAll('[data-field="packs"]'));
    var moneyField = document.querySelector('[data-field="money"]');
    var modeButtons = Array.prototype.slice.call(document.querySelectorAll(".segmented [data-mode]"));

    var fmtInt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
    var fmtDec = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

    function rub(n) {
      return fmtInt.format(Math.round(n)) + "\u00A0₽";
    }

    function packWord(v) {
      var n = Math.abs(v);
      if (Number.isInteger(n)) {
        var mod10 = n % 10;
        var mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11) return "пачка";
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "пачки";
        return "пачек";
      }
      return "пачки";
    }

    function setRangeFill(el) {
      var min = parseFloat(el.min);
      var max = parseFloat(el.max);
      var val = parseFloat(el.value);
      var p = ((val - min) / (max - min)) * 100;
      el.style.setProperty("--p", p.toFixed(2) + "%");
    }

    var displayed = { session: 0, daily: 0, year: 0 };
    var targets = { session: 0, daily: 0, year: 0 };
    var rafId = null;
    var snapId = null;

    function render() {
      sumSession.textContent = fmtInt.format(Math.round(displayed.session));
      sumDaily.textContent = rub(displayed.daily);
      sumYear.textContent = rub(displayed.year);
    }

    function snapToTargets() {
      displayed.session = targets.session;
      displayed.daily = targets.daily;
      displayed.year = targets.year;
      render();
    }

    function animateNumbers() {
      if (reduceMotion) {
        snapToTargets();
        return;
      }

      cancelAnimationFrame(rafId);
      window.clearTimeout(snapId);

      var from = { session: displayed.session, daily: displayed.daily, year: displayed.year };
      var start = performance.now();
      var duration = 420;

      /* Страховка: если requestAnimationFrame не срабатывает
         (фоновая вкладка, экономия ресурсов), цифры всё равно обновятся. */
      snapId = window.setTimeout(function () {
        cancelAnimationFrame(rafId);
        snapToTargets();
      }, duration + 260);

      function tick(now) {
        var t = Math.min((now - start) / duration, 1);
        var e = 1 - Math.pow(1 - t, 3);

        displayed.session = from.session + (targets.session - from.session) * e;
        displayed.daily = from.daily + (targets.daily - from.daily) * e;
        displayed.year = from.year + (targets.year - from.year) * e;
        render();

        if (t < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          window.clearTimeout(snapId);
        }
      }

      rafId = requestAnimationFrame(tick);
    }

    function update(animate) {
      var price = parseFloat(priceInput.value);
      var packs = parseFloat(packsInput.value);
      var daily = mode === "packs" ? price * packs : parseFloat(dailyInput.value);

      targets.daily = daily;
      targets.session = daily * DAYS;
      targets.year = daily * YEAR_DAYS;

      priceOut.textContent = rub(price);
      packsOut.textContent = fmtDec.format(packs) + "\u00A0" + packWord(packs);
      dailyOut.textContent = rub(dailyInput.value);
      hintDaily.textContent = rub(daily);

      if (messageText) {
        messageText.textContent =
          "Здравствуйте, Владислав!\n\n" +
          "Хочу записаться на сеанс и бросить курить.\n" +
          "Трачу на никотин около " + rub(daily) + " в день, " +
          "стоимость сеанса по расчёту — " + rub(daily * DAYS) + ".\n" +
          "Подскажите, пожалуйста, свободное время.";
      }

      setRangeFill(priceInput);
      setRangeFill(packsInput);
      setRangeFill(dailyInput);

      if (animate === false) {
        displayed.session = targets.session;
        displayed.daily = targets.daily;
        displayed.year = targets.year;
        render();
      } else {
        animateNumbers();
      }
    }

    function setMode(next) {
      mode = next;

      modeButtons.forEach(function (btn) {
        btn.setAttribute("aria-pressed", String(btn.getAttribute("data-mode") === mode));
      });

      packFields.forEach(function (field) { field.hidden = mode !== "packs"; });
      if (moneyField) moneyField.hidden = mode !== "money";

      update(true);
    }

    modeButtons.forEach(function (btn) {
      btn.addEventListener("click", function () { setMode(btn.getAttribute("data-mode")); });
    });

    priceInput.addEventListener("input", function () { update(true); });
    packsInput.addEventListener("input", function () { update(true); });
    dailyInput.addEventListener("input", function () { update(true); });

    /* ---------- Копирование готового сообщения ---------- */
    var copyTimer = null;
    var noteTimer = null;

    function fallbackCopy(text) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "-1000px";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();

      var ok = false;
      try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
      document.body.removeChild(area);
      return ok;
    }

    function copyMessage() {
      var text = messageText ? messageText.textContent : "";

      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(function () {
          return true;
        }).catch(function () {
          return fallbackCopy(text);
        });
      }

      return Promise.resolve(fallbackCopy(text));
    }

    function flashCopied() {
      if (!copyMsg) return;
      copyMsg.textContent = "Скопировано";
      copyMsg.classList.add("copied");
      window.clearTimeout(copyTimer);
      copyTimer = window.setTimeout(function () {
        copyMsg.textContent = "Скопировать";
        copyMsg.classList.remove("copied");
      }, 2200);
    }

    if (copyMsg) {
      copyMsg.addEventListener("click", function () {
        copyMessage().then(function (ok) {
          if (ok) {
            flashCopied();
            trackGoal("message_copied");
            return;
          }

          if (messageText) {
            var range = document.createRange();
            range.selectNodeContents(messageText);
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            copyMsg.textContent = "Выделено — Ctrl+C";
          }
        });
      });
    }

    if (sendBtn) {
      var consent = document.getElementById("consent");
      var consentLabel = consent ? consent.closest(".consent") : null;
      var defaultNote = "Отметьте согласие — кнопка станет активной.";

      function syncConsent() {
        if (!consent) return;
        sendBtn.disabled = !consent.checked;
        if (!consent.checked) {
          if (sendNote) sendNote.textContent = defaultNote;
          if (consentLabel) consentLabel.classList.remove("consent--error");
        }
      }

      if (consent) {
        consent.addEventListener("change", function () {
          syncConsent();
          if (consent.checked && sendNote) {
            sendNote.textContent = "Текст скопируется — вставьте его в чат.";
            trackGoal("consent_given");
          }
        });
      }

      sendBtn.addEventListener("click", function () {
        if (consent && !consent.checked) {
          syncConsent();
          if (consentLabel) consentLabel.classList.add("consent--error");
          if (sendNote) sendNote.textContent = "Сначала отметьте согласие с условиями.";
          return;
        }

        /* Копирование должно начаться в момент нажатия: на мобильных
           браузерах доступ к буферу обмена даётся только пользовательскому
           жесту, и открытие вкладки может этот жест «поглотить». */
        var copyPromise = copyMessage();

        /* Открываем Telegram сразу в обработчике клика,
           иначе браузер может заблокировать новую вкладку. */
        window.open(CONFIG.telegram, "_blank", "noopener");
        trackGoal("booking_click");

        copyPromise.then(function (ok) {
          if (!sendNote) return;
          sendNote.textContent = ok
            ? "Текст скопирован. Вставьте его в чат."
            : "Скопируйте текст из блока выше и вставьте в чат.";

          window.clearTimeout(noteTimer);
          noteTimer = window.setTimeout(function () {
            sendNote.textContent = consent && !consent.checked
              ? defaultNote
              : "Текст скопируется — вставьте его в чат.";
          }, 6000);
        });
      });

      syncConsent();
    }

    /* первичный расчёт — без «прыжка» цифр */
    update(false);
  }
})();
