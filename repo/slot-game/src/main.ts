import './style.css';

// --- Static Game Constants ---
const SYMBOL_COUNT = 8;
const REEL_COUNT = 5;
const SYMBOLS_PER_REEL = 3;
const SPIN_DURATION = 1000;
const STAGGER_DELAY = 200;
const WIN_LINE_DISPLAY_DURATION = 2500;
const COUNT_UP_DURATION = 600;
const MANUAL_SPIN_COOLDOWN = 1000;
const AUTO_SPIN_DELAY = 300;

// --- Logo Screen Constants ---
const LOGO_SOUND_DURATION = 2500; // Approximate duration of the logo sound
const LOGO_FADE_OUT_TIME = 1000;

// --- Animation Constants ---
const WIN_SYMBOL_SCALE = 1.2;
const WIN_SYMBOL_ROTATION_ANGLE = Math.PI / 20;
const FRAMES_PER_SECOND = 60;
const WIN_ANIMATION_PERIOD = 1;

// --- Bet Amounts (Total Bet) ---
const BET_AMOUNTS = [50, 100, 150, 200, 250];

// --- Original Frame Asset Dimensions ---
const ORIGINAL_FRAME_WIDTH = 1024;
const ORIGINAL_FRAME_HEIGHT = 768;
const ORIGINAL_REEL_AREA_START_X = 189;
const ORIGINAL_REEL_AREA_START_Y = 315;
const ORIGINAL_REEL_WIDTH = 117;
const ORIGINAL_REEL_HEIGHT = 264;
const ORIGINAL_REEL_SPACING_X = 126;

// --- Paylines & Payouts (as Multipliers for Line Bet) ---
const PAYOUTS: { [symbolId: string]: { [count: number]: number } } = {
  'symbol_01': { 3: 10,  4: 25,   5: 100 },
  'symbol_02': { 3: 10,  4: 25,   5: 100 },
  'symbol_03': { 3: 15,  4: 40,   5: 150 },
  'symbol_04': { 3: 15,  4: 40,   5: 150 },
  'symbol_05': { 3: 30,  4: 100,  5: 400 },
  'symbol_06': { 3: 50,  4: 200,  5: 800 },
  'symbol_07': { 3: 75,  4: 400,  5: 1500 },
  'symbol_08': { 3: 100, 4: 1000, 5: 5000 },
};

// --- Virtual Reel Strips ---
const REEL_STRIPS: Record<string, string[]> = {
  'reel_0': ['symbol_01', 'symbol_03', 'symbol_02', 'symbol_04', 'symbol_05', 'symbol_06', 'symbol_07', 'symbol_08', 'symbol_01', 'symbol_02', 'symbol_03', 'symbol_04'],
  'reel_1': ['symbol_01', 'symbol_02', 'symbol_03', 'symbol_04', 'symbol_05', 'symbol_06', 'symbol_07', 'symbol_08', 'symbol_01', 'symbol_02', 'symbol_03', 'symbol_04'],
  'reel_2': ['symbol_01', 'symbol_02', 'symbol_03', 'symbol_04', 'symbol_05', 'symbol_06', 'symbol_07', 'symbol_08', 'symbol_01', 'symbol_02', 'symbol_03', 'symbol_04'],
  'reel_3': ['symbol_01', 'symbol_02', 'symbol_03', 'symbol_04', 'symbol_05', 'symbol_06', 'symbol_07', 'symbol_08', 'symbol_01', 'symbol_02', 'symbol_03', 'symbol_04'],
  'reel_4': ['symbol_01', 'symbol_02', 'symbol_03', 'symbol_04', 'symbol_05', 'symbol_06', 'symbol_07', 'symbol_08', 'symbol_01', 'symbol_02', 'symbol_03', 'symbol_04'],
};

// --- Interfaces ---
interface ScaledFrame { x: number; y: number; width: number; height: number; scale: number; }
interface WinningWay { symbolId: string; comboLength: number; positions: number[][]; }

// --- AssetLoader Class ---
class AssetLoader {
  public images: { [key: string]: HTMLImageElement } = {};
  public sounds: { [key: string]: HTMLAudioElement } = {};
  private promises: Promise<any>[] = [];

  constructor() {
    this.loadSound('logo_sound', '/sounds/logo.mp3');
    this.loadImage('frame', '/images/slot_frame_processed.png');
    this.loadImage('reel_background', '/images/reel_background.png');
    for (let i = 1; i <= SYMBOL_COUNT; i++) {
      const id = `symbol_${String(i).padStart(2, '0')}`;
      this.loadImage(id, `/images/symbols/${id}.png`);
    }
    const soundFiles = ['sfx_reel_spin', 'sfx_reel_stop', 'sfx_button_click', 'sfx_win_small', 'sfx_win_medium', 'sfx_win_large', 'sfx_win_jackpot', 'bgm_casino_night'];
    soundFiles.forEach(id => this.loadSound(id, `/sounds/${id}.mp3`));
  }

  private loadImage(id: string, path: string) {
    const img = new Image();
    img.src = path;
    const p = new Promise(resolve => { img.onload = resolve; });
    this.promises.push(p);
    this.images[id] = img;
  }

  private loadSound(id: string, path: string) {
    const audio = new Audio();
    audio.src = path;
    const p = new Promise(resolve => { audio.oncanplaythrough = resolve; });
    this.promises.push(p);
    this.sounds[id] = audio;
  }

  public onReady(callback: () => void) {
    Promise.all(this.promises).then(callback);
  }
}

// --- Symbol Class ---
class Symbol {
  constructor(public id: string, public image: HTMLImageElement) {}
  draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, scale = 1, rotation = 0) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(scale, scale);
    ctx.rotate(rotation);
    ctx.drawImage(this.image, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
}

// --- Reel Class ---
class Reel {
  public symbols: Symbol[];
  public isSpinning = false;
  private yOffset = 0;
  private spinCompletionCallback: (() => void) | null = null;
  private finalSymbols: Symbol[] | null = null;
  private maxSpinSpeed: number;
  private fullStrip: Symbol[];
  private currentSpinSpeed = 0;
  private acceleration = 1.5;

  constructor(public x: number, public y: number, public symbolWidth: number, public symbolHeight: number, reelId: number, symbolMap: Map<string, Symbol>) {
    this.fullStrip = REEL_STRIPS[`reel_${reelId}`].map(id => symbolMap.get(id)!);
    this.symbols = [...this.fullStrip];
    this.maxSpinSpeed = (this.symbolHeight / (SPIN_DURATION / 200)) * 1.5;
  }

  public getResult(): Symbol[] { return this.symbols.slice(0, SYMBOLS_PER_REEL); }

  public setStopPosition(finalSymbols: Symbol[]) {
    const finalIds = finalSymbols.map(s => s.id);
    let foundIndex = -1;
    const stripLength = this.fullStrip.length;
    for (let i = 0; i < stripLength; i++) {
      if (this.fullStrip[i].id === finalIds[0] && this.fullStrip[(i + 1) % stripLength].id === finalIds[1] && this.fullStrip[(i + 2) % stripLength].id === finalIds[2]) {
        foundIndex = i;
        break;
      }
    }
    if (foundIndex !== -1) { this.symbols = [...this.fullStrip.slice(foundIndex), ...this.fullStrip.slice(0, foundIndex)]; }
  }

  startSpin() { this.isSpinning = true; this.currentSpinSpeed = 0; }

  stopSpin(finalSymbols: Symbol[], callback: () => void) {
    this.finalSymbols = finalSymbols;
    this.isSpinning = false;
    this.spinCompletionCallback = callback;
  }

  update() {
    if (this.isSpinning) {
      this.currentSpinSpeed = Math.min(this.maxSpinSpeed, this.currentSpinSpeed + this.acceleration);
      this.yOffset -= this.currentSpinSpeed;
      if (this.yOffset <= -this.symbolHeight) {
        this.yOffset += this.symbolHeight;
        this.symbols.shift();
        const randomIndex = Math.floor(Math.random() * this.fullStrip.length);
        this.symbols.push(this.fullStrip[randomIndex]);
      }
      return;
    }

    if (this.finalSymbols) {
      this.setStopPosition(this.finalSymbols);
      this.finalSymbols = null;
      if (this.yOffset === 0) { this.yOffset = -this.symbolHeight / 3; }
    }

    if (this.yOffset < 0) { this.yOffset = Math.min(0, this.yOffset + this.maxSpinSpeed / 1.5); }

    if (this.yOffset === 0 && this.spinCompletionCallback) {
      this.spinCompletionCallback();
      this.spinCompletionCallback = null;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let i = -1; i < SYMBOLS_PER_REEL + 1; i++) {
      let symbol;
      if (i === -1) { symbol = this.symbols[this.symbols.length - 1]; }
      else { symbol = this.symbols[i]; }

      if (symbol) {
        const symbolY = this.y + (i * this.symbolHeight) - this.yOffset;
        if (symbolY > this.y - this.symbolHeight && symbolY < this.y + (SYMBOLS_PER_REEL * this.symbolHeight)) {
          symbol.draw(ctx, this.x, symbolY, this.symbolWidth, this.symbolHeight);
        }
      }
    }
  }
}

// --- Game Class ---
class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private assets: AssetLoader;
  private symbols: Symbol[] = [];
  private reels: Reel[] = [];
  private symbolMap!: Map<string, Symbol>;
  private credits = 1000;
  private betIndex = 0;
  private isSpinning = false;
  private isAutoSpinning = false;
  private isShowingWins = false;
  private scaledFrame!: ScaledFrame;
  private winningWays: WinningWay[] = [];
  private currentWinLineIndex = 0;
  private winPresentationTimeout: number | null = null;
  private winCycleTimeout: number | null = null;
  private winAnimationTime = 0;
  private winNotificationTimeout: number | null = null;
  private isMuted = false;
  private bgmFadeInterval: number | null = null;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.assets = new AssetLoader();
    this.assets.onReady(() => {
      this.initGame();
      this.startLogoSequence();
      this.gameLoop();
    });
  }

  private startLogoSequence() {
    const logoContainer = document.getElementById('logo-container')!;
    const logoImage = document.getElementById('logo-image')!;
    const startPrompt = document.getElementById('start-prompt')!;

    this.playSound('logo_sound');

    setTimeout(() => {
      logoImage.classList.add('hidden');
      startPrompt.classList.remove('hidden');

      logoContainer.addEventListener('click', () => {
        this.playBgm();
        logoContainer.style.opacity = '0';
        setTimeout(() => {
          logoContainer.classList.add('hidden');
        }, LOGO_FADE_OUT_TIME);
      }, { once: true }); // Ensure the event listener only runs once

    }, LOGO_SOUND_DURATION);
  }

  private initGame() {
    this.canvas.width = 1280;
    this.canvas.height = 720;
    this.calculateFrameMetrics();

    for (const id in this.assets.images) {
      if (id.startsWith('symbol')) {
        this.symbols.push(new Symbol(id, this.assets.images[id]));
      }
    }
    this.symbolMap = new Map(this.symbols.map(s => [s.id, s]));

    const ssw = ORIGINAL_REEL_WIDTH * this.scaledFrame.scale;
    const ssh = (ORIGINAL_REEL_HEIGHT / SYMBOLS_PER_REEL) * this.scaledFrame.scale;
    const srsy = this.scaledFrame.y + (ORIGINAL_REEL_AREA_START_Y * this.scaledFrame.scale);

    for (let i = 0; i < REEL_COUNT; i++) {
      const orx = ORIGINAL_REEL_AREA_START_X + (i * ORIGINAL_REEL_SPACING_X);
      const srx = this.scaledFrame.x + (orx * this.scaledFrame.scale);
      this.reels.push(new Reel(srx, srsy, ssw, ssh, i, this.symbolMap));
    }

    this.setupUI();
    this.updateUI();
    (document.getElementById('ui-container') as HTMLElement).classList.remove('hidden');
  }

  private duckBgm() {
    if (this.bgmFadeInterval) clearInterval(this.bgmFadeInterval);
    const bgm = this.assets.sounds['bgm_casino_night'];
    if (bgm) bgm.volume = 0.3;
  }

  private restoreBgm() {
    const bgm = this.assets.sounds['bgm_casino_night'];
    if (!bgm || bgm.volume === 1.0) return;
    if (this.bgmFadeInterval) clearInterval(this.bgmFadeInterval);
    const fadeDuration = 500;
    const fadeSteps = 50;
    const volumeStep = (1.0 - bgm.volume) / fadeSteps;
    this.bgmFadeInterval = setInterval(() => {
      if (bgm.volume < 1.0) {
        bgm.volume = Math.min(1.0, bgm.volume + volumeStep);
      } else {
        bgm.volume = 1.0;
        if (this.bgmFadeInterval) clearInterval(this.bgmFadeInterval);
      }
    }, fadeDuration / fadeSteps);
  }

  private calculateFrameMetrics() {
    const f = this.assets.images['frame'];
    const ca = this.canvas.width / this.canvas.height;
    const fa = f.width / f.height;
    let w, h, x, y, s;
    if (ca > fa) { w = this.canvas.width; h = w / fa; x = 0; y = (this.canvas.height - h) / 2; }
    else { h = this.canvas.height; w = h * fa; x = (this.canvas.width - w) / 2; y = 0; }
    s = w / f.width;
    this.scaledFrame = { x, y, width: w, height: h, scale: s };
  }

  private playBgm() {
    const bgm = this.assets.sounds['bgm_casino_night'];
    if (bgm) {
      bgm.loop = true;
      const playPromise = bgm.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("BGM autoplay was blocked by the browser.", error);
        });
      }
    }
  }

  private setControlsDisabled(disabled: boolean) {
    (document.getElementById('spin-btn') as HTMLButtonElement).disabled = disabled;
    (document.getElementById('bet-plus-btn') as HTMLButtonElement).disabled = disabled;
    (document.getElementById('bet-minus-btn') as HTMLButtonElement).disabled = disabled;
    const autoSpinBtn = document.getElementById('auto-spin-btn') as HTMLButtonElement;
    if (this.isAutoSpinning) { autoSpinBtn.disabled = false; }
    else { autoSpinBtn.disabled = disabled; }
  }

  private setupUI() {
    (document.getElementById('ui-container') as HTMLElement).classList.add('hidden');
    document.getElementById('spin-btn')!.addEventListener('click', () => { this.stopAutoSpin(); this.spin(); });
    document.getElementById('bet-plus-btn')!.addEventListener('click', () => this.changeBet(1));
    document.getElementById('bet-minus-btn')!.addEventListener('click', () => this.changeBet(-1));
    document.getElementById('auto-spin-btn')!.addEventListener('click', () => this.toggleAutoSpin());
    document.getElementById('mute-btn')!.addEventListener('click', () => this.toggleMute());
  }

  private toggleMute() {
    this.isMuted = !this.isMuted;
    for (const sound in this.assets.sounds) { this.assets.sounds[sound].muted = this.isMuted; }
    document.getElementById('mute-btn')!.textContent = this.isMuted ? '🔇' : '🔊';
  }

  private toggleAutoSpin() {
    if (this.isAutoSpinning) { this.stopAutoSpin(); }
    else {
      if (this.isSpinning || this.isShowingWins) return;
      this.isAutoSpinning = true;
      const btn = document.getElementById('auto-spin-btn')!;
      btn.textContent = 'STOP';
      this.spin();
    }
  }

  private stopAutoSpin() {
    if (this.isAutoSpinning) {
      this.isAutoSpinning = false;
      document.getElementById('auto-spin-btn')!.textContent = 'AUTO';
    }
  }

  private changeBet(direction: number) {
    if (this.isSpinning || this.isShowingWins) return;
    this.stopAutoSpin();
    this.betIndex += direction;
    if (this.betIndex < 0) this.betIndex = BET_AMOUNTS.length - 1;
    if (this.betIndex >= BET_AMOUNTS.length) this.betIndex = 0;
    this.playSound('sfx_button_click');
    this.updateUI();
  }

  private updateUI() {
    document.getElementById('credits-display')!.textContent = this.credits.toString();
    document.getElementById('bet-display')!.textContent = BET_AMOUNTS[this.betIndex].toString();
  }

  private playSound(id: string) {
    if (this.isMuted) return;
    const s = this.assets.sounds[id];
    if (s) {
      s.currentTime = 0;
      if (id === 'sfx_reel_spin') { s.volume = 0.5; }
      else { s.volume = 1.0; }
      const playPromise = s.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn(`Audio play failed for [${id}]:`, error);
        });
      }
    }
  }

  private spin() {
    if (this.isSpinning) return;
    if (this.isShowingWins) { this.clearWinPresentation(); }

    const betAmount = BET_AMOUNTS[this.betIndex];
    if (this.credits < betAmount) { this.stopAutoSpin(); return; }

    const bgm = this.assets.sounds['bgm_casino_night'];
    if (bgm && bgm.paused) { this.playBgm(); }

    this.isSpinning = true;
    this.setControlsDisabled(true);
    this.winAnimationTime = 0;
    this.credits -= betAmount;
    this.updateUI();
    this.playSound('sfx_button_click');
    this.playSound('sfx_reel_spin');

    this.reels.forEach(r => r.startSpin());

    for (let i = 0; i < REEL_COUNT; i++) {
      setTimeout(() => {
        const reelStrip = REEL_STRIPS[`reel_${i}`];
        const stopIndex = Math.floor(Math.random() * reelStrip.length);
        const finalSymbols = [
          this.symbolMap.get(reelStrip[stopIndex])!,
          this.symbolMap.get(reelStrip[(stopIndex + 1) % reelStrip.length])!,
          this.symbolMap.get(reelStrip[(stopIndex + 2) % reelStrip.length])!,
        ];
        this.reels[i].stopSpin(finalSymbols, () => {
          this.playSound('sfx_reel_stop');
          if (i === REEL_COUNT - 1) { this.onSpinComplete(); }
        });
      }, SPIN_DURATION + i * STAGGER_DELAY);
    }
  }

  private clearWinPresentation() {
    this.isShowingWins = false;
    this.winningWays = [];
    this.currentWinLineIndex = 0;
    if (this.winPresentationTimeout) clearTimeout(this.winPresentationTimeout);
    if (this.winNotificationTimeout) clearTimeout(this.winNotificationTimeout);
    if (this.winCycleTimeout) clearTimeout(this.winCycleTimeout);
    document.getElementById('win-notification')!.classList.add('hidden');
    document.getElementById('big-win-text')!.classList.add('hidden');
    document.getElementById('mega-win-text')!.classList.add('hidden');
    this.restoreBgm();
    this.setControlsDisabled(false);
  }

  private onSpinComplete() {
    this.isSpinning = false;
    this.assets.sounds['sfx_reel_spin']?.pause();
    const finalGrid = this.reels.map(r => r.getResult());
    setTimeout(() => { this.checkWins(finalGrid); }, 500);
  }

  private checkWins(finalGrid: Symbol[][]) {
    this.winningWays = [];
    let totalWin = 0;
    const betMultiplier = BET_AMOUNTS[this.betIndex] / 50;

    const uniqueSymbolsInFirstReel = [...new Set(finalGrid[0].map(s => s.id))];

    uniqueSymbolsInFirstReel.forEach(symbolId => {
      let comboLength = 1;
      let positions: number[][] = [];
      finalGrid[0].forEach((s, i) => { if (s.id === symbolId) positions.push([0, i]); });

      let waysCount = positions.length;

      for (let i = 1; i < REEL_COUNT; i++) {
        const nextReelSymbols = finalGrid[i];
        const matchingPositionsInNextReel: number[] = [];
        nextReelSymbols.forEach((s, j) => { if (s.id === symbolId) matchingPositionsInNextReel.push(j); });

        if (matchingPositionsInNextReel.length > 0) {
          comboLength++;
          waysCount *= matchingPositionsInNextReel.length;
          matchingPositionsInNextReel.forEach(pos => positions.push([i, pos]));
        } else { break; }
      }

      if (comboLength >= 3) {
        const multiplier = PAYOUTS[symbolId]?.[comboLength];
        if (multiplier) {
          totalWin += multiplier * waysCount * betMultiplier;
          this.winningWays.push({ symbolId, comboLength, positions });
        }
      }
    });

    if (totalWin > 0) {
      this.credits += totalWin;
      this.showWinNotification(totalWin, () => { this.startWinPresentation(); });
      const totalBet = BET_AMOUNTS[this.betIndex];
      if (totalWin >= totalBet * 20) { this.playSound('sfx_win_jackpot'); this.showWinText('mega'); this.duckBgm(); }
      else if (totalWin >= totalBet * 10) { this.playSound('sfx_win_large'); this.showWinText('big'); this.duckBgm(); }
      else if (totalWin >= totalBet * 5) { this.playSound('sfx_win_medium'); this.showWinText('big'); this.duckBgm(); }
      else { this.playSound('sfx_win_small'); }
      this.updateUI();
    } else {
      if (this.isAutoSpinning) { setTimeout(() => this.spin(), AUTO_SPIN_DELAY); }
      else { this.setControlsDisabled(false); }
    }
  }

  private startWinPresentation() {
    this.isShowingWins = true;
    const durationPerWay = WIN_LINE_DISPLAY_DURATION / this.winningWays.length;

    if (this.isAutoSpinning) {
      const showNextWin = (index: number) => {
        if (index >= this.winningWays.length) {
          this.endWinPresentation();
          return;
        }
        this.currentWinLineIndex = index;
        this.winPresentationTimeout = setTimeout(() => showNextWin(index + 1), durationPerWay);
      };
      showNextWin(0);
    } else {
      const showNextWin = (index: number) => {
        const nextIndex = index % this.winningWays.length;
        this.currentWinLineIndex = nextIndex;
        this.winPresentationTimeout = setTimeout(() => showNextWin(nextIndex + 1), durationPerWay);
      };
      showNextWin(0);
    }
  }

  private endWinPresentation() {
    this.clearWinPresentation();
    if (this.isAutoSpinning) { setTimeout(() => this.spin(), AUTO_SPIN_DELAY); }
  }

  private showWinNotification(amount: number, onComplete: () => void) {
    this.isShowingWins = true;
    const notification = document.getElementById('win-notification')!;
    const counter = document.getElementById('win-amount-counter')!;
    notification.classList.remove('hidden');
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / COUNT_UP_DURATION, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const currentAmount = Math.floor(easeOutProgress * amount);
      counter.textContent = currentAmount.toString();
      if (progress < 1) { requestAnimationFrame(step); }
      else {
        counter.textContent = amount.toString();
        this.winNotificationTimeout = setTimeout(onComplete, 1000);
      }
    };
    requestAnimationFrame(step);
  }

  private showWinText(type: 'big' | 'mega') {
    const elementId = type === 'big' ? 'big-win-text' : 'mega-win-text';
    document.getElementById(elementId)!.classList.remove('hidden');
  }

  private gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }

  private update() {
    if (this.isShowingWins) { this.winAnimationTime++; }
    else { this.reels.forEach(r => r.update()); }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawReelBackground();
    this.drawReels();
    this.drawReelShadows();
    this.drawWinningSymbolAnimations();
    this.drawFrame();
  }

  private drawReelBackground() {
    const bg = this.assets.images['reel_background'];
    if (bg && bg.complete) {
      const bgX = this.scaledFrame.x + (ORIGINAL_REEL_AREA_START_X * this.scaledFrame.scale);
      const bgY = this.scaledFrame.y + (ORIGINAL_REEL_AREA_START_Y * this.scaledFrame.scale);
      const bgWidth = 621 * this.scaledFrame.scale;
      const bgHeight = ORIGINAL_REEL_HEIGHT * this.scaledFrame.scale;
      this.ctx.drawImage(bg, bgX, bgY, bgWidth, bgHeight);
    } else {
      this.ctx.fillStyle = 'rgba(0, 0, 20, 1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private drawReels() { this.reels.forEach(reel => reel.draw(this.ctx)); }

  private drawReelShadows() {
    const reelAreaX = this.scaledFrame.x + (ORIGINAL_REEL_AREA_START_X * this.scaledFrame.scale);
    const reelAreaY = this.scaledFrame.y + (ORIGINAL_REEL_AREA_START_Y * this.scaledFrame.scale);
    const reelAreaWidth = (ORIGINAL_REEL_WIDTH * REEL_COUNT + ORIGINAL_REEL_SPACING_X * (REEL_COUNT - 1)) * this.scaledFrame.scale;
    const reelAreaHeight = ORIGINAL_REEL_HEIGHT * this.scaledFrame.scale;
    const gradientHeight = this.reels[0].symbolHeight * 0.5;

    const topGradient = this.ctx.createLinearGradient(0, reelAreaY, 0, reelAreaY + gradientHeight);
    topGradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    topGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = topGradient;
    this.ctx.fillRect(reelAreaX, reelAreaY, reelAreaWidth, gradientHeight);

    const bottomGradient = this.ctx.createLinearGradient(0, reelAreaY + reelAreaHeight - gradientHeight, 0, reelAreaY + reelAreaHeight);
    bottomGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    bottomGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    this.ctx.fillStyle = bottomGradient;
    this.ctx.fillRect(reelAreaX, reelAreaY + reelAreaHeight - gradientHeight, reelAreaWidth, gradientHeight);
  }

  private drawWinningSymbolAnimations() {
    if (!this.isShowingWins || this.winningWays.length === 0) return;
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.reels.forEach(reel => {
      this.ctx.fillRect(reel.x, reel.y, reel.symbolWidth, reel.symbolHeight * SYMBOLS_PER_REEL);
    });
    this.ctx.restore();

    const currentWay = this.winningWays[this.currentWinLineIndex];
    if (!currentWay) return;

    const scale = WIN_SYMBOL_SCALE;
    const rotation = Math.sin(this.winAnimationTime * (2 * Math.PI / (FRAMES_PER_SECOND * WIN_ANIMATION_PERIOD))) * WIN_SYMBOL_ROTATION_ANGLE;

    currentWay.positions.forEach(([reelIndex, rowIndex]) => {
      const reel = this.reels[reelIndex];
      const symbol = reel.getResult()[rowIndex];
      if (symbol && symbol.id === currentWay.symbolId) {
        const symbolY = reel.y + (rowIndex * reel.symbolHeight);
        symbol.draw(this.ctx, reel.x, symbolY, reel.symbolWidth, reel.symbolHeight, scale, rotation);
      }
    });
  }

  private drawFrame() {
    const f = this.assets.images['frame'];
    if (f && f.complete) {
      this.ctx.drawImage(f, this.scaledFrame.x, this.scaledFrame.y, this.scaledFrame.width, this.scaledFrame.height);
    }
  }
}

new Game();