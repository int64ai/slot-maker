
import './style.css';

// --- Static Game Constants ---
const SYMBOL_COUNT = 8;
const REEL_COUNT = 5;
const SYMBOLS_PER_REEL = 3;
const SPIN_DURATION = 1000;
const STAGGER_DELAY = 200;
const WIN_LINE_DISPLAY_DURATION = 1500;
const PAYLINE_COUNT = 5;
const COUNT_UP_DURATION = 600;
const MANUAL_SPIN_COOLDOWN = 1000;
const AUTO_SPIN_DELAY = 300;

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
const PAYLINES = [
  [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0], [2, 1, 0, 1, 2],
];
const PAYOUTS: { [symbolId: string]: { [count: number]: number } } = {
  'symbol_01': { 3: 10,  4: 25,   5: 100 }, 'symbol_02': { 3: 10,  4: 25,   5: 100 },
  'symbol_03': { 3: 15,  4: 40,   5: 150 }, 'symbol_04': { 3: 15,  4: 40,   5: 150 },
  'symbol_05': { 3: 25,  4: 75,   5: 250 }, 'symbol_06': { 3: 40,  4: 100,  5: 400 },
  'symbol_07': { 3: 50,  4: 200,  5: 750 }, 'symbol_08': { 3: 100, 4: 1000, 5: 5000 },
};

// --- Virtual Reel Strips ---
const REEL_STRIPS: Record<string, string[]> = {
  'reel_0': ['symbol_01', 'symbol_03', 'symbol_02', 'symbol_04', 'symbol_01', 'symbol_05', 'symbol_02', 'symbol_03', 'symbol_01', 'symbol_04', 'symbol_02', 'symbol_06', 'symbol_01', 'symbol_03', 'symbol_02', 'symbol_07', 'symbol_01', 'symbol_04', 'symbol_01', 'symbol_02', 'symbol_05', 'symbol_03', 'symbol_01', 'symbol_08'],
  'reel_1': ['symbol_01', 'symbol_04', 'symbol_02', 'symbol_05', 'symbol_01', 'symbol_03', 'symbol_02', 'symbol_06', 'symbol_01', 'symbol_04', 'symbol_02', 'symbol_03', 'symbol_01', 'symbol_05', 'symbol_02', 'symbol_07', 'symbol_01', 'symbol_03', 'symbol_01', 'symbol_02', 'symbol_04', 'symbol_01', 'symbol_01', 'symbol_08'],
  'reel_2': ['symbol_02', 'symbol_05', 'symbol_01', 'symbol_03', 'symbol_02', 'symbol_04', 'symbol_01', 'symbol_06', 'symbol_02', 'symbol_03', 'symbol_01', 'symbol_05', 'symbol_02', 'symbol_04', 'symbol_01', 'symbol_07', 'symbol_02', 'symbol_03', 'symbol_01', 'symbol_02', 'symbol_01', 'symbol_04', 'symbol_02', 'symbol_08'],
  'reel_3': ['symbol_03', 'symbol_06', 'symbol_01', 'symbol_04', 'symbol_02', 'symbol_05', 'symbol_01', 'symbol_03', 'symbol_02', 'symbol_04', 'symbol_01', 'symbol_06', 'symbol_03', 'symbol_05', 'symbol_01', 'symbol_07', 'symbol_02', 'symbol_04', 'symbol_01', 'symbol_03', 'symbol_02', 'symbol_01', 'symbol_03', 'symbol_08'],
  'reel_4': ['symbol_04', 'symbol_07', 'symbol_01', 'symbol_05', 'symbol_02', 'symbol_06', 'symbol_03', 'symbol_04', 'symbol_01', 'symbol_05', 'symbol_02', 'symbol_03', 'symbol_01', 'symbol_06', 'symbol_02', 'symbol_04', 'symbol_01', 'symbol_03', 'symbol_02', 'symbol_05', 'symbol_01', 'symbol_02', 'symbol_01', 'symbol_08'],
};

// --- Interfaces ---
interface ScaledFrame { x: number; y: number; width: number; height: number; scale: number; }
interface WinningLine { payline: number[]; symbolId: string; comboLength: number; }

// --- AssetLoader Class ---
class AssetLoader {
  public images: { [key: string]: HTMLImageElement } = {}; public sounds: { [key: string]: HTMLAudioElement } = {};
  private promises: Promise<any>[] = [];
  constructor() {
    this.loadImage('frame', '/images/slot_frame_processed.png');
    this.loadImage('reel_background', '/images/reel_background.png');
    for (let i = 1; i <= SYMBOL_COUNT; i++) { const id = `symbol_${String(i).padStart(2, '0')}`; this.loadImage(id, `/images/symbols/${id}.png`); }
    const soundFiles = ['sfx_reel_spin', 'sfx_reel_stop', 'sfx_button_click', 'sfx_win_small', 'sfx_win_medium', 'sfx_win_large', 'sfx_win_jackpot'];
    soundFiles.forEach(id => this.loadSound(id, `/sounds/${id}.mp3`));
  }
  private loadImage(id: string, path: string) { const i = new Image(); i.src = path; const p = new Promise(r => { i.onload = r; }); this.promises.push(p); this.images[id] = i; }
  private loadSound(id: string, path: string) { const a = new Audio(); a.src = path; const p = new Promise(r => { a.oncanplaythrough = r; }); this.promises.push(p); this.sounds[id] = a; }
  public onReady(cb: () => void) { Promise.all(this.promises).then(cb); }
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
  public symbols: Symbol[]; public isSpinning = false;
  private yOffset = 0; private spinCompletionCallback: (() => void) | null = null;
  private spinSpeed: number; private fullStrip: Symbol[];
  constructor(public x: number, public y: number, public symbolWidth: number, public symbolHeight: number, reelId: number, symbolMap: Map<string, Symbol>) {
    this.fullStrip = REEL_STRIPS[`reel_${reelId}`].map(id => symbolMap.get(id)!);
    this.symbols = [...this.fullStrip];
    this.spinSpeed = this.symbolHeight / (SPIN_DURATION / 200);
  }
  public getResult(): Symbol[] { return this.symbols.slice(0, SYMBOLS_PER_REEL); }
  public setStopPosition(finalSymbols: Symbol[]) {
    const finalIds = finalSymbols.map(s => s.id); let foundIndex = -1; const stripLength = this.fullStrip.length;
    for (let i = 0; i < stripLength; i++) {
      if (this.fullStrip[i].id === finalIds[0] && this.fullStrip[(i + 1) % stripLength].id === finalIds[1] && this.fullStrip[(i + 2) % stripLength].id === finalIds[2]) {
        foundIndex = i; break;
      }
    }
    if (foundIndex !== -1) { this.symbols = [...this.fullStrip.slice(foundIndex), ...this.fullStrip.slice(0, foundIndex)]; }
  }
  startSpin() { this.isSpinning = true; }
  stopSpin(callback: () => void) { this.isSpinning = false; this.spinCompletionCallback = callback; }
  update() {
    if (this.isSpinning) { this.yOffset += this.spinSpeed; if (this.yOffset >= this.symbolHeight) { this.yOffset %= this.symbolHeight; this.symbols.unshift(this.symbols.pop()!); } return; }
    if (this.yOffset > 0) { this.yOffset = Math.max(0, this.yOffset - this.spinSpeed / 1.5); if (this.yOffset < 1) this.yOffset = 0; }
    if (this.yOffset === 0 && this.spinCompletionCallback) { this.spinCompletionCallback(); this.spinCompletionCallback = null; }
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (let i = -1; i < SYMBOLS_PER_REEL + 1; i++) {
      const symbol = this.symbols[i];
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
  private canvas: HTMLCanvasElement; private ctx: CanvasRenderingContext2D; private assets: AssetLoader;
  private symbols: Symbol[] = []; private reels: Reel[] = []; private symbolMap!: Map<string, Symbol>;
  private credits = 1000; private betIndex = 0;
  private isSpinning = false; private isAutoSpinning = false; private isShowingWins = false;
  private scaledFrame!: ScaledFrame; private winningLines: WinningLine[] = [];
  private currentWinLineIndex = 0; private winPresentationTimeout: number | null = null;
  private winAnimationTime = 0;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement; this.ctx = this.canvas.getContext('2d')!;
    this.assets = new AssetLoader(); this.assets.onReady(() => this.init());
  }
  private calculateFrameMetrics() {
    const f = this.assets.images['frame']; const ca = this.canvas.width / this.canvas.height; const fa = f.width / f.height;
    let w, h, x, y, s;
    if (ca > fa) { w = this.canvas.width; h = w / fa; x = 0; y = (this.canvas.height - h) / 2; }
    else { h = this.canvas.height; w = h * fa; x = (this.canvas.width - w) / 2; y = 0; }
    s = w / f.width; this.scaledFrame = { x, y, width: w, height: h, scale: s };
  }
  private init() {
    this.canvas.width = 1280; this.canvas.height = 720; this.calculateFrameMetrics();
    for (const id in this.assets.images) { if (id.startsWith('symbol')) { this.symbols.push(new Symbol(id, this.assets.images[id])); } }
    this.symbolMap = new Map(this.symbols.map(s => [s.id, s]));
    const ssw = ORIGINAL_REEL_WIDTH * this.scaledFrame.scale; const ssh = (ORIGINAL_REEL_HEIGHT / SYMBOLS_PER_REEL) * this.scaledFrame.scale;
    const srsy = this.scaledFrame.y + (ORIGINAL_REEL_AREA_START_Y * this.scaledFrame.scale);
    for (let i = 0; i < REEL_COUNT; i++) {
      const orx = ORIGINAL_REEL_AREA_START_X + (i * ORIGINAL_REEL_SPACING_X);
      const srx = this.scaledFrame.x + (orx * this.scaledFrame.scale);
      this.reels.push(new Reel(srx, srsy, ssw, ssh, i, this.symbolMap));
    }
    this.setupUI(); this.updateUI(); this.gameLoop();
  }
  private setControlsDisabled(disabled: boolean) {
    (document.getElementById('spin-btn') as HTMLButtonElement).disabled = disabled;
    (document.getElementById('bet-plus-btn') as HTMLButtonElement).disabled = disabled;
    (document.getElementById('bet-minus-btn') as HTMLButtonElement).disabled = disabled;
    const autoSpinBtn = document.getElementById('auto-spin-btn') as HTMLButtonElement;
    if (this.isAutoSpinning) { autoSpinBtn.disabled = false; } else { autoSpinBtn.disabled = disabled; }
  }
  private setupUI() {
    document.getElementById('spin-btn')!.addEventListener('click', () => { this.stopAutoSpin(); this.spin(); });
    document.getElementById('bet-plus-btn')!.addEventListener('click', () => this.changeBet(1));
    document.getElementById('bet-minus-btn')!.addEventListener('click', () => this.changeBet(-1));
    document.getElementById('auto-spin-btn')!.addEventListener('click', () => this.toggleAutoSpin());
  }
  private toggleAutoSpin() {
    if (this.isAutoSpinning) { this.stopAutoSpin(); }
    else { if (this.isSpinning || this.isShowingWins) return; this.isAutoSpinning = true; const btn = document.getElementById('auto-spin-btn')!; btn.textContent = 'STOP'; this.spin(); }
  }
  private stopAutoSpin() { if (this.isAutoSpinning) { this.isAutoSpinning = false; document.getElementById('auto-spin-btn')!.textContent = 'AUTO'; } }
  private changeBet(direction: number) {
    if (this.isSpinning || this.isShowingWins) return;
    this.stopAutoSpin(); this.betIndex += direction;
    if (this.betIndex < 0) this.betIndex = BET_AMOUNTS.length - 1;
    if (this.betIndex >= BET_AMOUNTS.length) this.betIndex = 0;
    this.playSound('sfx_button_click'); this.updateUI();
  }
  private updateUI() { document.getElementById('credits-display')!.textContent = this.credits.toString(); document.getElementById('bet-display')!.textContent = BET_AMOUNTS[this.betIndex].toString(); }
  private playSound(id: string) { const s = this.assets.sounds[id]; if (s) { s.currentTime = 0; s.play(); } }
  private spin() {
    const betAmount = BET_AMOUNTS[this.betIndex];
    if (this.isSpinning || this.isShowingWins || this.credits < betAmount) { this.stopAutoSpin(); return; }
    this.isSpinning = true; this.setControlsDisabled(true); this.winAnimationTime = 0;
    this.credits -= betAmount; this.updateUI(); this.playSound('sfx_button_click'); this.playSound('sfx_reel_spin');
    for (let i = 0; i < REEL_COUNT; i++) {
      const reelStrip = REEL_STRIPS[`reel_${i}`]; const stopIndex = Math.floor(Math.random() * reelStrip.length);
      const finalSymbols = [this.symbolMap.get(reelStrip[stopIndex])!, this.symbolMap.get(reelStrip[(stopIndex + 1) % reelStrip.length])!, this.symbolMap.get(reelStrip[(stopIndex + 2) % reelStrip.length])!,];
      this.reels[i].setStopPosition(finalSymbols);
    }
    this.reels.forEach(r => r.startSpin());
    for (let i = 0; i < REEL_COUNT; i++) { setTimeout(() => { this.reels[i].stopSpin(() => { this.playSound('sfx_reel_stop'); if (i === REEL_COUNT - 1) { this.onSpinComplete(); } }); }, SPIN_DURATION + i * STAGGER_DELAY); }
  }
  private onSpinComplete() {
    this.isSpinning = false; this.assets.sounds['sfx_reel_spin']?.pause();
    const finalGrid = this.reels.map(r => r.getResult());
    setTimeout(() => { this.checkWins(finalGrid); }, 500);
  }
  private checkWins(finalGrid: Symbol[][]) {
    this.winningLines = []; let totalWin = 0; let isJackpot = false;
    const totalBet = BET_AMOUNTS[this.betIndex]; const lineBet = totalBet / PAYLINE_COUNT;
    PAYLINES.forEach(line => {
      const firstSymbol = finalGrid[0][line[0]]; let comboLength = 1;
      for (let i = 1; i < REEL_COUNT; i++) { if (finalGrid[i][line[i]].id === firstSymbol.id) { comboLength++; } else { break; } }
      if (comboLength >= 3) {
        const multiplier = PAYOUTS[firstSymbol.id]?.[comboLength];
        if (multiplier) {
          totalWin += multiplier * lineBet;
          this.winningLines.push({ payline: line, symbolId: firstSymbol.id, comboLength });
          if (firstSymbol.id === 'symbol_08' && comboLength === 5) { isJackpot = true; }
        }
      }
    });
    if (totalWin > 0) {
      this.credits += totalWin;
      this.showWinNotification(totalWin, () => { this.startWinPresentation(); });
      if (isJackpot) { this.playSound('sfx_win_jackpot'); }
      else if (totalWin >= totalBet * 15) { this.playSound('sfx_win_large'); }
      else if (totalWin >= totalBet * 5) { this.playSound('sfx_win_medium'); }
      else { this.playSound('sfx_win_small'); }
      this.updateUI();
    } else {
      if (this.isAutoSpinning) { setTimeout(() => this.spin(), AUTO_SPIN_DELAY); }
      else { this.setControlsDisabled(false); }
    }
  }
  private startWinPresentation() {
    this.isShowingWins = true; this.currentWinLineIndex = 0;
    const cycle = () => { this.currentWinLineIndex = (this.currentWinLineIndex + 1) % this.winningLines.length; this.winPresentationTimeout = setTimeout(cycle, WIN_LINE_DISPLAY_DURATION); };
    this.winPresentationTimeout = setTimeout(cycle, WIN_LINE_DISPLAY_DURATION);
    setTimeout(() => this.endWinPresentation(), this.winningLines.length * WIN_LINE_DISPLAY_DURATION * 2);
  }
  private endWinPresentation() {
    this.isShowingWins = false; this.winningLines = [];
    if (this.winPresentationTimeout) clearTimeout(this.winPresentationTimeout);
    if (this.isAutoSpinning) { setTimeout(() => this.spin(), AUTO_SPIN_DELAY); }
    else { setTimeout(() => this.setControlsDisabled(false), MANUAL_SPIN_COOLDOWN); }
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
        setTimeout(() => { notification.classList.add('hidden'); onComplete(); }, 1000);
      }
    };
    requestAnimationFrame(step);
  }
  private gameLoop() { this.update(); this.draw(); requestAnimationFrame(() => this.gameLoop()); }
  private update() {
    if (this.isShowingWins) { this.winAnimationTime++; }
    else { this.reels.forEach(r => r.update()); }
  }
  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawReelBackground();
    this.drawReels();
    this.drawWinningSymbolAnimations();
    this.drawFrame();
    this.drawWinningLines();
  }
  private drawReelBackground() {
    const bg = this.assets.images['reel_background'];
    if (bg && bg.complete) {
      const bgX = this.scaledFrame.x + (ORIGINAL_REEL_AREA_START_X * this.scaledFrame.scale);
      const bgY = this.scaledFrame.y + (ORIGINAL_REEL_AREA_START_Y * this.scaledFrame.scale);
      // Corrected width calculation to preserve aspect ratio
      const bgWidth = 621 * this.scaledFrame.scale;
      const bgHeight = ORIGINAL_REEL_HEIGHT * this.scaledFrame.scale;
      this.ctx.drawImage(bg, bgX, bgY, bgWidth, bgHeight);
    } else {
      // Fallback to dark blue if image fails to load
      this.ctx.fillStyle = 'rgba(0, 0, 20, 1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  private drawReels() {
    this.reels.forEach(reel => reel.draw(this.ctx));
  }
  private drawWinningSymbolAnimations() {
    if (!this.isShowingWins || this.winningLines.length === 0) return;
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.reels.forEach(reel => {
        this.ctx.fillRect(reel.x, reel.y, reel.symbolWidth, reel.symbolHeight * SYMBOLS_PER_REEL);
    });
    this.ctx.restore();
    const currentLine = this.winningLines[this.currentWinLineIndex];
    const scale = WIN_SYMBOL_SCALE;
    const rotation = Math.sin(this.winAnimationTime * (2 * Math.PI / (FRAMES_PER_SECOND * WIN_ANIMATION_PERIOD))) * WIN_SYMBOL_ROTATION_ANGLE;
    for (let i = 0; i < currentLine.comboLength; i++) {
      const reel = this.reels[i];
      const symbol = reel.getResult()[currentLine.payline[i]];
      const symbolY = reel.y + (currentLine.payline[i] * reel.symbolHeight);
      symbol.draw(this.ctx, reel.x, symbolY, reel.symbolWidth, reel.symbolHeight, scale, rotation);
    }
  }
  private drawFrame() { const f = this.assets.images['frame']; if (f) { this.ctx.drawImage(f, this.scaledFrame.x, this.scaledFrame.y, this.scaledFrame.width, this.scaledFrame.height); } }
  private drawWinningLines() {
    if (!this.isShowingWins || this.winningLines.length === 0) return;
    const line = this.winningLines[this.currentWinLineIndex];
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)'; this.ctx.lineWidth = 8;
    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.9)'; this.ctx.shadowBlur = 15;
    this.ctx.beginPath();
    for (let i = 0; i < REEL_COUNT; i++) {
      const reel = this.reels[i];
      const symbolY = reel.y + (line.payline[i] * reel.symbolHeight) + (reel.symbolHeight / 2);
      const symbolX = reel.x + (reel.symbolWidth / 2);
      if (i === 0) { this.ctx.moveTo(symbolX, symbolY); } else { this.ctx.lineTo(symbolX, symbolY); }
    }
    this.ctx.stroke();
    this.ctx.restore();
  }
}
new Game();
