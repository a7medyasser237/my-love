/* =========================================================
   لوحة تعديل الموقع — غيّر البيانات هنا فقط.
   كلمة السر الافتراضية: ourlove
   ========================================================= */
const CONFIG = {
  password: "14321",
  yourName: "أحمد",
  partnerName: "سارة",
  relationshipStart: "2021-03-14T00:00:00",
  milestoneDate: "2021-03-14",
  introMessage: "مش عارف ده فعلاً هيبقى إيه... بس عملتلك حاجة مخصوص علشانك ♥",
  welcomeMessage: "كل حاجة جوا هنا لينا إحنا... حاجات صغيرة يمكن متعرفيش إني لسه فاكرها ♥",
  subtitle: "المكان بتاعنا إحنا الاتنين بس ♥",
  letterTitle: "رسالة صغيرة من قلبي",
  letterText: `مش عارف أبدأ كلامي منين، بس عارف إن وجودك في حياتي من الحاجات اللي بتخلّي الأيام العادية أحلى.

حبيت أعملك المكان الصغير ده علشان أجمع فيه شوية من الكلام اللي جوايا، والذكريات اللي بحبها، والحاجات اللي نفسي أفضل أفتكرها معاكي.

يمكن الهدية دي بسيطة، بس كل تفصيلة فيها معمولة بحب، ونفسي كل ما تفتحيها تبتسمي وتفتكري إن فيه حد شايفك شخص مميز جدًا.

شكرًا على كل لحظة حلوة، ولسه عندنا حكايات كتير نستناها ونعيشها سوا. ♥`,
  giftMessage: "عايز أقولك إن أحسن قرار أخدته في حياتي كان إني عرفتك ♥",
  messages: [
    { sender: "your", text: "كل لحظة معاكي بتفرق معايا ♥" },
    { sender: "your", text: "مهما عدي الوقت عمري ما هبطل أحبك ♥♥" },
    { sender: "your", text: "انتي احلي واغلي واجمل وارق حاجة حصلت في حياتي كلها ♥♥" },
    { sender: "your", text: "حبيت أعملك المفاجأة دي علشان كل اللحظات الحلوة ما تنسيش هنا ♥" },
    { sender: "your", text: "بحبك جداً ♥♥♥" },
    { sender: "partner", text: "وأنا بحبك أكتر بكتير 💗💗💗" }
  ]
};

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const HEART_PATH = "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z";
const SVG_NS = "http://www.w3.org/2000/svg";
const AUTH_STORAGE_KEY = "loveGiftUnlockedAnimationV2";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const introScreen = $("#introScreen");
const lockScreen = $("#lockScreen");
const interludeScreen = $("#interludeScreen");
const siteContent = $("#siteContent");
const envelopeButton = $("#openEnvelope");
const introLetterCard = $("#introLetterCard");
const introTypedText = $("#introTypedText");
const goToPasswordButton = $("#goToPassword");
const unlockForm = $("#unlockForm");
const passcodeInput = $("#passcode");
const lockError = $("#lockError");
const togglePasswordButton = $("#togglePassword");
const passwordEyeIcon = $("#passwordEyeIcon");
const passwordEyeOffIcon = $("#passwordEyeOffIcon");
const interludeTypedText = $("#interludeTypedText");
const enterWebsiteButton = $("#enterWebsite");
const music = $("#backgroundMusic");
const musicDock = $("#musicDock");
const toast = $("#toast");
let toastTimer = 0;
let heartTimer = 0;
let lastFocusedElement = null;
let introStarted = false;
let introTypingToken = 0;
let welcomeStarted = false;
let chatSequenceStarted = false;
let subtitleStarted = false;
let letterTypingToken = 0;
let galleryIndex = 0;
let galleryTimer = null;
let galleryIsPlaying = false;
let galleryItems = [];
let galleryCloneCount = 0;
let galleryStep = 0;
let galleryTrigger = null;
let imageOpenedFromGallery = false;
let galleryWasPlayingBeforeImage = false;

function createHeartIcon(filled = false) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("class", filled ? "heart-icon heart-icon-filled" : "heart-icon");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", HEART_PATH);
  path.setAttribute("fill", filled ? "currentColor" : "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", filled ? "1.1" : "1.8");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  svg.appendChild(path);
  return svg;
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

// تقسيم النص إلى حروف/رموز مرئية صحيحة (بما فيها الإيموجي المركب).
function getCharacters(text) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("ar", { granularity: "grapheme" });
    return [...segmenter.segment(text)].map((part) => part.segment);
  }
  return Array.from(text);
}

async function typeText(element, text, options = {}) {
  const { speed = 44, punctuationPause = 160, token = null, guard = null } = options;
  const currentToken = token;
  element.textContent = "";
  element.classList.add("is-typing");
  if (reduceMotion) {
    element.textContent = text;
    element.classList.remove("is-typing");
    return;
  }
  const characters = getCharacters(text);
  for (const character of characters) {
    if (token !== null && currentToken !== letterTypingToken) return;
    if (guard && !guard()) return;
    element.textContent += character;
    const isPausePunctuation = /[.,،؛:!?؟…\n]/u.test(character);
    await sleep(isPausePunctuation ? punctuationPause : speed + (character.trim() ? 0 : 16));
  }
  element.classList.remove("is-typing");
}

function rememberUnlockedSession() {
  try { sessionStorage.setItem(AUTH_STORAGE_KEY, "true"); } catch (_) { /* التخزين قد يكون محظورًا في بعض البيئات */ }
}

function hasUnlockedSession() {
  try { return sessionStorage.getItem(AUTH_STORAGE_KEY) === "true"; } catch (_) { return false; }
}

function applyConfiguration() {
  $$('[data-your-name]').forEach((node) => { node.textContent = CONFIG.yourName; });
  $$('[data-partner-name]').forEach((node) => { node.textContent = CONFIG.partnerName; });
  $("#modalLetterTitle").textContent = CONFIG.letterTitle;
  $("#milestoneDate").textContent = `${CONFIG.milestoneDate} 📅`;
  $("#milestoneDate").setAttribute("datetime", CONFIG.milestoneDate);
  $("#homeSubtitle").dataset.typewriterText = CONFIG.subtitle;
  $("#letterMessage").dataset.fullText = CONFIG.letterText;
  $("#giftMessageText").dataset.fullText = CONFIG.giftMessage;
  document.title = `Our place | ${CONFIG.yourName} ♥ ${CONFIG.partnerName}`;
  renderChatMessages();
}

function renderChatMessages() {
  const chatList = $("#chatList");
  chatList.replaceChildren();
  CONFIG.messages.forEach((message, index) => {
    const bubble = document.createElement("article");
    bubble.className = `chat-bubble ${message.sender === "partner" ? "chat-bubble-partner" : "chat-bubble-yours"}`;
    bubble.style.setProperty("--bubble-delay", `${index * 90}ms`);
    bubble.dataset.messageIndex = String(index);
    const sender = document.createElement("span");
    sender.className = "chat-sender";
    sender.textContent = message.sender === "partner" ? CONFIG.partnerName : CONFIG.yourName;
    const text = document.createElement("p");
    text.className = "chat-bubble-text typewriter-text";
    text.dataset.fullText = message.text;
    bubble.append(sender, text);
    chatList.appendChild(bubble);
  });
}

function showToast(message) {
  toast.replaceChildren();
  const parts = String(message).split(/([♡♥])/u);
  parts.forEach((part) => {
    if (part === "♡" || part === "♥") toast.appendChild(createHeartIcon(part === "♥"));
    else if (part) toast.appendChild(document.createTextNode(part));
  });
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3000);
}

function startIntroEnvelope() {
  if (introStarted) return;
  introStarted = true;
  const thisIntroToken = ++introTypingToken;
  envelopeButton.classList.add("is-open");
  envelopeButton.setAttribute("aria-expanded", "true");
  window.setTimeout(async () => {
    introLetterCard.hidden = false;
    introLetterCard.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => introLetterCard.classList.add("is-visible"));
    await sleep(reduceMotion ? 0 : 220);
    await typeText(introTypedText, CONFIG.introMessage, { speed: 47, punctuationPause: 230, guard: () => thisIntroToken === introTypingToken });
    if (thisIntroToken !== introTypingToken) return;
    if (goToPasswordButton.hidden) {
      goToPasswordButton.hidden = false;
      goToPasswordButton.classList.add("button-arrives");
    }
  }, reduceMotion ? 0 : 650);
}

function closeIntroLetter() {
  introTypingToken += 1;
  introStarted = false;
  introLetterCard.classList.remove("is-visible");
  introLetterCard.setAttribute("aria-hidden", "true");
  window.setTimeout(() => { introLetterCard.hidden = true; }, reduceMotion ? 0 : 250);
  envelopeButton.classList.remove("is-open");
  envelopeButton.setAttribute("aria-expanded", "false");
  goToPasswordButton.hidden = true;
  introTypedText.textContent = "";
}

async function transitionStage(fromStage, toStage) {
  fromStage.classList.add("stage-leaving");
  await sleep(reduceMotion ? 0 : 350);
  fromStage.hidden = true;
  fromStage.classList.remove("stage-leaving");
  toStage.hidden = false;
  toStage.classList.add("stage-arriving");
  requestAnimationFrame(() => requestAnimationFrame(() => toStage.classList.add("stage-arrived")));
  await sleep(reduceMotion ? 0 : 550);
  toStage.classList.remove("stage-arriving", "stage-arrived");
}

async function showInterlude() {
  await transitionStage(lockScreen, interludeScreen);
  if (welcomeStarted) return;
  welcomeStarted = true;
  interludeTypedText.textContent = "";
  await sleep(200);
  await typeText(interludeTypedText, CONFIG.welcomeMessage, { speed: 43, punctuationPause: 200 });
  enterWebsiteButton.hidden = false;
  enterWebsiteButton.classList.add("button-arrives");
}

function showMainSite() {
  introScreen.hidden = true;
  lockScreen.hidden = true;
  interludeScreen.hidden = true;
  siteContent.hidden = false;
  musicDock.hidden = false;
  siteContent.classList.remove("site-hidden");
  siteContent.classList.add("site-entering");
  window.setTimeout(() => siteContent.classList.remove("site-entering"), reduceMotion ? 0 : 1000);
  startFloatingHearts();
  initializeScrollAnimations();
  startHomeSubtitle();
  updateCounter();
}

function unlockSite(event) {
  event.preventDefault();
  const enteredPassword = passcodeInput.value.trim().toLocaleLowerCase("en");
  const correctPassword = CONFIG.password.trim().toLocaleLowerCase("en");
  if (enteredPassword === correctPassword) {
    rememberUnlockedSession();
    lockError.hidden = true;
    passcodeInput.removeAttribute("aria-invalid");
    void showInterlude();
    return;
  }
  lockError.hidden = false;
  passcodeInput.setAttribute("aria-invalid", "true");
  passcodeInput.focus();
  lockScreen.querySelector(".password-stage-inner").classList.remove("shake-error");
  requestAnimationFrame(() => lockScreen.querySelector(".password-stage-inner").classList.add("shake-error"));
}

function togglePasswordVisibility() {
  const shouldRevealPassword = passcodeInput.type === "password";
  passcodeInput.type = shouldRevealPassword ? "text" : "password";
  togglePasswordButton.setAttribute("aria-pressed", String(shouldRevealPassword));
  togglePasswordButton.setAttribute("aria-label", shouldRevealPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور");
  togglePasswordButton.setAttribute("title", shouldRevealPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور");
  passwordEyeIcon.hidden = shouldRevealPassword;
  passwordEyeOffIcon.hidden = !shouldRevealPassword;
  togglePasswordButton.classList.remove("eye-tap");
  requestAnimationFrame(() => togglePasswordButton.classList.add("eye-tap"));
  passcodeInput.focus();
}

function updateCounter() {
  const startDate = new Date(CONFIG.relationshipStart);
  if (Number.isNaN(startDate.getTime())) {
    ["daysCount", "hoursCount", "minutesCount", "secondsCount"].forEach((id) => { $("#" + id).textContent = "—"; });
    return;
  }
  const seconds = Math.max(0, Math.floor((Date.now() - startDate.getTime()) / 1000));
  const values = {
    daysCount: String(Math.floor(seconds / 86400)).padStart(2, "0"),
    hoursCount: String(Math.floor((seconds % 86400) / 3600)).padStart(2, "0"),
    minutesCount: String(Math.floor((seconds % 3600) / 60)).padStart(2, "0"),
    secondsCount: String(seconds % 60).padStart(2, "0")
  };
  Object.entries(values).forEach(([id, value]) => {
    const el = $("#" + id);
    if (el.textContent !== value) {
      el.textContent = value;
      el.classList.remove("digit-tick");
      requestAnimationFrame(() => el.classList.add("digit-tick"));
    }
  });
}

function startFloatingHearts() {
  if (heartTimer) return;
  const container = $("#floatingHearts");
  const addHeart = (burst = false, originX = null, originY = null) => {
    const heart = document.createElement("span");
    heart.className = burst ? "floating-heart burst-heart" : "floating-heart";
    const filled = Math.random() > 0.35;
    heart.appendChild(createHeartIcon(filled));
    heart.style.left = originX === null ? `${Math.random() * 100}%` : `${originX}px`;
    heart.style.setProperty("--duration", `${burst ? 1.2 + Math.random() * .9 : 7 + Math.random() * 8}s`);
    heart.style.setProperty("--size", `${burst ? 12 + Math.random() * 18 : 11 + Math.random() * 15}px`);
    if (burst) {
      heart.style.top = `${originY}px`;
      heart.style.setProperty("--burst-x", `${(Math.random() - .5) * 220}px`);
      heart.style.setProperty("--burst-y", `${-40 - Math.random() * 160}px`);
    }
    container.appendChild(heart);
    window.setTimeout(() => heart.remove(), burst ? 2400 : 16000);
  };
  for (let i = 0; i < 10; i += 1) window.setTimeout(() => addHeart(), i * 280);
  heartTimer = window.setInterval(() => {
    if (!document.hidden) addHeart();
  }, 900);
}

function burstHeartsAt(element, amount = 20) {
  const rect = element.getBoundingClientRect();
  for (let i = 0; i < amount; i += 1) {
    window.setTimeout(() => startBurstParticle(rect.left + rect.width / 2, rect.top + rect.height / 2), i * 25);
  }
}
function startBurstParticle(x, y) {
  const container = $("#floatingHearts");
  const heart = document.createElement("span");
  heart.className = "floating-heart burst-heart";
  heart.appendChild(createHeartIcon(Math.random() > .3));
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  heart.style.setProperty("--duration", `${1.1 + Math.random() * .8}s`);
  heart.style.setProperty("--size", `${10 + Math.random() * 17}px`);
  heart.style.setProperty("--burst-x", `${(Math.random() - .5) * 260}px`);
  heart.style.setProperty("--burst-y", `${-25 - Math.random() * 180}px`);
  container.appendChild(heart);
  window.setTimeout(() => heart.remove(), 2300);
}

function startHomeSubtitle() {
  if (subtitleStarted || siteContent.hidden) return;
  subtitleStarted = true;
  const subtitle = $("#homeSubtitle");
  window.setTimeout(() => typeText(subtitle, CONFIG.subtitle, { speed: 68, punctuationPause: 200 }), reduceMotion ? 0 : 600);
}

function initializeScrollAnimations() {
  const revealTargets = $$(".reveal, .memory-card");
  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
    void runChatSequence();
    return;
  }
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
      if (entry.target.id === "messages" || entry.target.classList.contains("chat-card")) void runChatSequence();
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  revealTargets.forEach((el) => revealObserver.observe(el));
  const chatSection = $("#messages");
  if (chatSection && chatSection.getBoundingClientRect().top < window.innerHeight * .85) void runChatSequence();
}

async function runChatSequence() {
  if (chatSequenceStarted || siteContent.hidden) return;
  chatSequenceStarted = true;
  const bubbles = $$(".chat-bubble", $("#chatList"));
  for (const [index, bubble] of bubbles.entries()) {
    bubble.classList.add("is-visible");
    await sleep(index === 0 ? 150 : 250);
    const text = $(".chat-bubble-text", bubble);
    await typeText(text, text.dataset.fullText || "", { speed: 28, punctuationPause: 100 });
  }
}

function openModal(modal) {
  lastFocusedElement = document.activeElement;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  const closeButton = $(".modal-close", modal);
  if (closeButton) closeButton.focus();
}
function closeModal(modal) {
  const closingGallery = modal.id === "memoriesGalleryModal";
  const closingImage = modal.id === "imageModal";
  const returningToGallery = closingImage && imageOpenedFromGallery &&
    $("#memoriesGalleryModal").classList.contains("is-open");

  if (closingGallery) setGalleryAutoplay(false);

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");

  // Keep the page locked whenever another modal (for example, the gallery behind
  // the enlarged image) is still open.
  if ($$(".modal.is-open").length === 0) {
    document.body.classList.remove("modal-open");
  } else {
    document.body.classList.add("modal-open");
  }

  if (returningToGallery) {
    imageOpenedFromGallery = false;
    if (galleryWasPlayingBeforeImage) setGalleryAutoplay(true);
    galleryWasPlayingBeforeImage = false;
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
    return;
  }

  if (closingGallery) {
    if (galleryTrigger && typeof galleryTrigger.focus === "function") galleryTrigger.focus();
    galleryTrigger = null;
    return;
  }

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

function getGalleryItems() {
  const visibleCards = $$('.memory-list .memory-card', $('#memories'));
  const galleryOnlyCards = $$('.gallery-source-item', $('#gallerySource'));

  return [...visibleCards, ...galleryOnlyCards].map((card, index) => {
    const thumbnail = $('img', card);
    const captionElement = $('.memory-caption, .gallery-photo-caption', card);
    const visibleCaption = captionElement
      ? captionElement.textContent.replace(/\s+/g, ' ').trim()
      : '';
    const dataCaption = (card.dataset.galleryCaption || '').trim();

    // الكابشن المكتوب داخل البطاقة هو الأساس، حتى لو كان قلبًا أحمر فقط.
    // نستخدم data-gallery-caption كبديل عند عدم وجود كابشن ظاهر.
    const caption = visibleCaption || dataCaption || `ذكرى ${index + 1}`;
    const src = (card.dataset.galleryImage || thumbnail?.getAttribute('src') || '').trim();
    const thumbSrc = thumbnail?.getAttribute('src') || src;

    return {
      src,
      thumbSrc,
      caption,
      alt: thumbnail?.alt || (caption === '❤️' || caption === '♥' ? `ذكرى ${index + 1}` : caption)
    };
  }).filter((item) => item.src && item.thumbSrc);
}

function getGalleryVisibleIndex() {
  if (!galleryItems.length) return 0;
  return ((galleryIndex - galleryCloneCount) % galleryItems.length + galleryItems.length) % galleryItems.length;
}

function createGalleryPhoto(item, index, isClone = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'gallery-photo-card';
  button.dataset.galleryIndex = String(index);
  button.setAttribute('aria-label', `عرض الذكرى: ${item.caption}`);
  if (isClone) {
    button.setAttribute('aria-hidden', 'true');
    button.tabIndex = -1;
  }

  const image = document.createElement('img');
  image.src = item.thumbSrc;
  image.alt = isClone ? '' : item.alt;
  image.loading = 'lazy';
  image.decoding = 'async';

  const caption = document.createElement('span');
  caption.className = 'gallery-photo-caption';
  if (item.caption === '❤️' || item.caption === '♥') {
    caption.classList.add('is-heart-caption');
  }
  caption.textContent = item.caption;

  button.append(image, caption);
  button.addEventListener('click', () => openGalleryPhoto(index));
  return button;
}

function renderGalleryCarousel() {
  const track = $('#galleryTrack');
  const dots = $('#galleryDots');
  track.replaceChildren();
  dots.replaceChildren();
  galleryItems = getGalleryItems();
  galleryCloneCount = Math.min(3, galleryItems.length);

  // صور مكررة في البداية والنهاية حتى تظل الحركة دائرية بلا توقف مفاجئ.
  galleryItems.slice(-galleryCloneCount).forEach((item, offset) => {
    const actualIndex = galleryItems.length - galleryCloneCount + offset;
    track.appendChild(createGalleryPhoto(item, actualIndex, true));
  });
  galleryItems.forEach((item, index) => track.appendChild(createGalleryPhoto(item, index)));
  galleryItems.slice(0, galleryCloneCount).forEach((item, index) => {
    track.appendChild(createGalleryPhoto(item, index, true));
  });

  galleryItems.forEach((item, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'gallery-dot';
    dot.setAttribute('aria-label', `الانتقال إلى الصورة ${index + 1}`);
    dot.setAttribute('aria-pressed', 'false');
    dot.addEventListener('click', () => goToGalleryPhoto(index));
    dots.appendChild(dot);
  });

  galleryIndex = galleryCloneCount;
  galleryStep = 0;
  $('#galleryImageCaption').textContent = galleryItems[0]?.caption || '';
  $('#galleryImageCount').textContent = galleryItems.length ? `1 / ${galleryItems.length}` : '0 / 0';
}

function measureGalleryStep() {
  const track = $('#galleryTrack');
  const firstPhoto = $('.gallery-photo-card', track);
  if (!firstPhoto) return 0;
  const styles = window.getComputedStyle(track);
  const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
  return firstPhoto.getBoundingClientRect().width + gap;
}

function updateGalleryPosition(animate = true) {
  const track = $('#galleryTrack');
  if (!track || !galleryItems.length) return;

  galleryStep = measureGalleryStep() || galleryStep;
  track.style.transition = animate && !reduceMotion ? '' : 'none';
  track.style.transform = `translate3d(${-galleryIndex * galleryStep}px, 0, 0)`;

  const visibleIndex = getGalleryVisibleIndex();
  const activeCaption = galleryItems[visibleIndex].caption;
  const captionMeta = $('#galleryImageCaption');
  captionMeta.textContent = activeCaption;
  captionMeta.classList.toggle('is-heart-caption', activeCaption === '❤️' || activeCaption === '♥');
  $('#galleryImageCount').textContent = `${visibleIndex + 1} / ${galleryItems.length}`;
  $$('.gallery-dot').forEach((dot, index) => {
    const active = index === visibleIndex;
    dot.classList.toggle('is-active', active);
    dot.setAttribute('aria-pressed', String(active));
  });
}

function handleGalleryTransitionEnd(event) {
  if (event.propertyName !== 'transform' || !galleryItems.length) return;
  const firstRealIndex = galleryCloneCount;
  const afterLastRealIndex = galleryCloneCount + galleryItems.length;

  if (galleryIndex >= afterLastRealIndex) {
    galleryIndex = firstRealIndex;
    updateGalleryPosition(false);
  } else if (galleryIndex < firstRealIndex) {
    galleryIndex = afterLastRealIndex - 1;
    updateGalleryPosition(false);
  }
}

function moveGallery(direction) {
  if (galleryItems.length < 2) return;
  galleryIndex += direction;
  updateGalleryPosition(true);
}

function goToGalleryPhoto(index) {
  if (!galleryItems.length) return;
  galleryIndex = galleryCloneCount + ((index % galleryItems.length) + galleryItems.length) % galleryItems.length;
  updateGalleryPosition(true);
}

function openGalleryPhoto(index) {
  const item = galleryItems[index];
  if (!item) return;

  const image = $('#expandedImage');
  image.src = item.src;
  image.alt = item.alt || item.caption;
  $('#expandedCaption').textContent = item.caption;

  // Keep the gallery open underneath the enlarged photo.
  imageOpenedFromGallery = true;
  galleryWasPlayingBeforeImage = galleryIsPlaying;
  if (galleryIsPlaying) setGalleryAutoplay(false);

  openModal($('#imageModal'));
}

function setGalleryAutoplay(shouldPlay) {
  galleryIsPlaying = Boolean(shouldPlay) && !reduceMotion && galleryItems.length > 1;
  if (galleryTimer) {
    window.clearInterval(galleryTimer);
    galleryTimer = null;
  }

  const toggle = $('#galleryAutoplayToggle');
  if (toggle) {
    toggle.textContent = galleryIsPlaying ? 'Ⅱ إيقاف الحركة' : '▶ تشغيل تلقائي';
    toggle.setAttribute('aria-pressed', String(galleryIsPlaying));
  }

  if (galleryIsPlaying) {
    galleryTimer = window.setInterval(() => {
      if (!document.hidden && $('#memoriesGalleryModal').classList.contains('is-open')) {
        moveGallery(1);
      }
    }, 2600);
  }
}

function openMemoriesGallery() {
  renderGalleryCarousel();
  if (!galleryItems.length) {
    showToast('أضف صور ذكرياتكم في قسم الذكريات أولاً ♥');
    return;
  }
  galleryTrigger = document.activeElement;
  openModal($('#memoriesGalleryModal'));
  requestAnimationFrame(() => updateGalleryPosition(false));
  setGalleryAutoplay(!reduceMotion);
  if (reduceMotion) showToast('يمكنك تشغيل حركة الصور من زر التشغيل ♥');
}

function setupMemoriesGallery() {
  $('#openMemoriesGallery').addEventListener('click', openMemoriesGallery);
  $('#galleryPrevious').addEventListener('click', () => moveGallery(-1));
  $('#galleryNext').addEventListener('click', () => moveGallery(1));
  $('#galleryAutoplayToggle').addEventListener('click', () => setGalleryAutoplay(!galleryIsPlaying));
  $('#galleryTrack').addEventListener('transitionend', handleGalleryTransitionEnd);

  // السحب يمينًا ويسارًا يعمل على شاشات اللمس أيضًا.
  const viewport = $('#galleryViewport');
  let touchStartX = null;
  viewport.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0]?.clientX ?? null;
  }, { passive: true });
  viewport.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const difference = touchEndX - touchStartX;
    if (Math.abs(difference) > 35) moveGallery(difference < 0 ? 1 : -1);
    touchStartX = null;
  }, { passive: true });

  window.addEventListener('resize', () => {
    if ($('#memoriesGalleryModal').classList.contains('is-open')) {
      updateGalleryPosition(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!$('#memoriesGalleryModal').classList.contains('is-open')) return;
    if ($('#imageModal').classList.contains('is-open')) return;
    if (event.key === 'ArrowLeft') moveGallery(1);
    if (event.key === 'ArrowRight') moveGallery(-1);
  });
}

async function toggleMusic() {
  const toggle = $("#musicToggle");
  try {
    if (music.paused) {
      await music.play();
      toggle.classList.add("is-playing");
      musicDock.classList.add("is-playing");
      toggle.setAttribute("aria-pressed", "true");
      toggle.setAttribute("aria-label", "إيقاف الأغنية");
      $("#musicPlayGlyph").textContent = "Ⅱ";
      $("#musicSubLabel").textContent = "شغّالة دلوقتي ♥";
    } else {
      music.pause();
      toggle.classList.remove("is-playing");
      musicDock.classList.remove("is-playing");
      toggle.setAttribute("aria-pressed", "false");
      toggle.setAttribute("aria-label", "تشغيل الأغنية");
      $("#musicPlayGlyph").textContent = "▶";
      $("#musicSubLabel").textContent = "أغنيتنا المفضلة";
    }
  } catch (_) {
    showToast("ضيف ملف الأغنية باسم song.mp3 داخل مجلد assets 🎵");
  }
}

async function toggleGift() {
  const button = $("#giftButton");
  const reveal = $("#giftReveal");
  const isOpening = button.getAttribute("aria-expanded") !== "true";
  button.setAttribute("aria-expanded", String(isOpening));
  button.classList.toggle("is-open", isOpening);
  $("#giftButtonLabel").textContent = isOpening ? "المفاجأة اتفتحت ♥" : "اضغط هنا";
  if (isOpening) {
    reveal.hidden = false;
    requestAnimationFrame(() => reveal.classList.add("is-visible"));
    burstHeartsAt(button, 26);
    const message = $("#giftMessageText");
    await sleep(280);
    await typeText(message, CONFIG.giftMessage, { speed: 39, punctuationPause: 170 });
  } else {
    reveal.classList.remove("is-visible");
    await sleep(reduceMotion ? 0 : 250);
    reveal.hidden = true;
    $("#giftMessageText").textContent = "";
  }
}

function setupMessageEditor() {
  const openButton = $("#openMessageEditor");
  const form = $("#messageEditor");
  openButton.addEventListener("click", () => {
    form.hidden = !form.hidden;
    openButton.classList.toggle("is-editing", !form.hidden);
    if (!form.hidden) {
      form.classList.add("editor-visible");
      $("#customMessage").focus();
    } else form.classList.remove("editor-visible");
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = $("#customMessage").value.trim();
    if (!value) return;
    const bubble = document.createElement("article");
    bubble.className = "chat-bubble chat-bubble-partner is-visible";
    const sender = document.createElement("span");
    sender.className = "chat-sender";
    sender.textContent = CONFIG.partnerName;
    const text = document.createElement("p");
    text.className = "chat-bubble-text typewriter-text";
    bubble.append(sender, text);
    $("#chatList").appendChild(bubble);
    await typeText(text, value, { speed: 30, punctuationPause: 120 });
    $("#customMessage").value = "";
    form.hidden = true;
    openButton.classList.remove("is-editing");
    showToast("اتضافت رسالتك ♥");
  });
}

// أحداث الشاشات الافتتاحية.
envelopeButton.addEventListener("click", startIntroEnvelope);
$("#closeIntroLetter").addEventListener("click", closeIntroLetter);
goToPasswordButton.addEventListener("click", () => { void transitionStage(introScreen, lockScreen).then(() => passcodeInput.focus()); });
unlockForm.addEventListener("submit", unlockSite);
togglePasswordButton.addEventListener("click", togglePasswordVisibility);
passcodeInput.addEventListener("input", () => {
  lockError.hidden = true;
  passcodeInput.removeAttribute("aria-invalid");
});
enterWebsiteButton.addEventListener("click", () => {
  showMainSite();
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

// الموسيقى، الخطاب، الصور، والهدية.
$("#musicToggle").addEventListener("click", toggleMusic);
$("#openLetter").addEventListener("click", async () => {
  const modal = $("#letterModal");
  openModal(modal);
  const message = $("#letterMessage");
  letterTypingToken += 1;
  const token = letterTypingToken;
  await sleep(220);
  await typeText(message, CONFIG.letterText, { speed: 28, punctuationPause: 180, token });
});
$$("[data-close-modal]").forEach((element) => {
  element.addEventListener("click", () => {
    const modal = element.closest(".modal");
    if (modal) closeModal(modal);
    letterTypingToken += 1;
  });
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  // The enlarged image is layered above the gallery, so close it first.
  const imageModal = $("#imageModal");
  const galleryModal = $("#memoriesGalleryModal");

  if (imageModal.classList.contains("is-open")) {
    closeModal(imageModal);
    return;
  }
  if (galleryModal.classList.contains("is-open")) {
    closeModal(galleryModal);
    return;
  }

  const otherOpenModals = $$(".modal.is-open");
  if (otherOpenModals.length) closeModal(otherOpenModals[otherOpenModals.length - 1]);
});
$$("[data-gallery-image]").forEach((card) => {
  card.addEventListener("click", () => {
    const image = $("#expandedImage");
    image.src = card.dataset.galleryImage;
    image.alt = card.dataset.galleryCaption || "ذكرى جميلة";
    $("#expandedCaption").textContent = card.dataset.galleryCaption || "ذكرى جميلة";
    openModal($("#imageModal"));
  });
});
$("#giftButton").addEventListener("click", toggleGift);
setupMemoriesGallery();
setupMessageEditor();

// تهيئة النصوص. لو دخول سابق محفوظ في نفس التاب، نفتح الموقع مباشرة.
applyConfiguration();
startFloatingHearts();
if (hasUnlockedSession()) {
  showMainSite();
} else {
  introScreen.hidden = false;
  lockScreen.hidden = true;
  interludeScreen.hidden = true;
  siteContent.hidden = true;
  musicDock.hidden = true;
}
updateCounter();
window.setInterval(updateCounter, 1000);
