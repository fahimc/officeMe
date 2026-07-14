"use strict";

class OfficeCharacter {
  constructor(scene, options) {
    this.scene = scene;
    this.name = options.name;
    this.role = options.role;
    this.gender = options.gender || "female";
    this.palette = {
      jacket: options.jacket || "#4a84c5",
      jacketLight: options.jacketLight || "#6c9bd5",
      pants: options.pants || "#27313d",
      hair: options.hair || "#222831",
      hairHighlight: options.hairHighlight || "#3c4550",
      skin: options.skin || "#ffc49d",
      skinDark: options.skinDark || "#f1b58d"
    };
    this.x = options.x;
    this.y = options.y;
    this.speed = options.speed || 64;
    this.scale = options.scale || 0.82;
    this.path = [];
    this.pathIndex = 0;
    this.selected = false;
    this.roamTimer = Math.random() * 2;
    this.walkTime = Math.random() * 10;
    this.manualHold = 0;
    this._buildRig();
  }

  static svgMarkup() {
    return `
      <div class="actor-ring"></div>
      <svg class="rig-svg" viewBox="0 0 240 300" aria-label="Front-facing rigged office character">
        <g class="part-body">
          <g class="part-leg-left" data-x="106" data-y="190">
            <path class="rig-part pants" d="M-11 0 Q0 -4 11 0 L9 39 Q0 44 -9 39 Z"/>
            <g class="part-calf-left" data-x="0" data-y="34">
              <path class="rig-part pants-light" d="M-9 0 Q0 -3 9 0 L8 34 Q0 38 -8 34 Z"/>
              <path class="rig-part shoe" d="M-10 27 Q0 23 10 27 L13 36 Q2 43 -12 36 Z"/>
              <path d="M-10 35 Q1 40 12 35" fill="none" stroke="#e9edf0" stroke-width="3" stroke-linecap="round"/>
            </g>
          </g>

          <g class="part-leg-right" data-x="134" data-y="190">
            <path class="rig-part pants" d="M-11 0 Q0 -4 11 0 L9 39 Q0 44 -9 39 Z"/>
            <g class="part-calf-right" data-x="0" data-y="34">
              <path class="rig-part pants-light" d="M-9 0 Q0 -3 9 0 L8 34 Q0 38 -8 34 Z"/>
              <path class="rig-part shoe" d="M-10 27 Q0 23 10 27 L13 36 Q2 43 -12 36 Z"/>
              <path d="M-10 35 Q1 40 12 35" fill="none" stroke="#e9edf0" stroke-width="3" stroke-linecap="round"/>
            </g>
          </g>

          <path class="rig-part hair female-only" d="M76 89 C76 40 91 22 120 21 C150 22 165 42 164 91 L157 148 Q139 162 120 158 Q98 163 81 148 Z"/>

          <g class="part-arm-left" data-x="89" data-y="137">
            <path class="rig-part jacket" d="M-8 0 Q0 -5 8 0 L9 39 Q0 45 -9 39 Z"/>
            <g class="part-forearm-left" data-x="0" data-y="34">
              <path class="rig-part jacket-light" d="M-7 0 Q0 -3 7 0 L7 25 Q0 30 -7 25 Z"/>
              <circle class="rig-part skin-light" cx="0" cy="27" r="8"/>
            </g>
          </g>

          <g class="part-arm-right" data-x="151" data-y="137">
            <path class="rig-part jacket" d="M-8 0 Q0 -5 8 0 L9 39 Q0 45 -9 39 Z"/>
            <g class="part-forearm-right" data-x="0" data-y="34">
              <path class="rig-part jacket-light" d="M-7 0 Q0 -3 7 0 L7 25 Q0 30 -7 25 Z"/>
              <circle class="rig-part skin-light" cx="0" cy="27" r="8"/>
            </g>
          </g>

          <g class="part-torso">
            <g class="female-only">
              <path class="rig-part shirt" d="M101 127 Q120 117 139 127 L144 188 Q120 199 96 188 Z"/>
              <path class="rig-part jacket" d="M98 127 Q108 121 114 122 L116 190 Q103 191 92 185 L91 142 Q91 132 98 127 Z"/>
              <path class="rig-part jacket" d="M142 127 Q132 121 126 122 L124 190 Q137 191 148 185 L149 142 Q149 132 142 127 Z"/>
              <path d="M107 126 L119 143 L113 156" fill="none" stroke="#101722" stroke-width="3.2" stroke-linejoin="round"/>
              <path d="M133 126 L121 143 L127 156" fill="none" stroke="#101722" stroke-width="3.2" stroke-linejoin="round"/>
            </g>
            <g class="male-only">
              <path class="rig-part shirt" d="M99 126 Q120 115 141 126 L145 188 Q120 197 95 188 Z"/>
              <path class="rig-part jacket" d="M94 128 Q104 120 116 120 L118 190 Q102 191 91 184 L90 142 Q90 133 94 128 Z"/>
              <path class="rig-part jacket" d="M146 128 Q136 120 124 120 L122 190 Q138 191 149 184 L150 142 Q150 133 146 128 Z"/>
              <path d="M120 137 L120 171" fill="none" stroke="#223147" stroke-width="5" stroke-linecap="round"/>
              <path d="M114 170 L120 180 L126 170 Z" fill="#223147" stroke="#101722" stroke-width="2.5" stroke-linejoin="round"/>
            </g>
            <path class="lanyard" d="M109 129 L120 151 L131 129"/>
            <rect class="badge-card" x="112" y="149" width="16" height="20" rx="2"/>
            <path d="M116 154 H124" stroke="#4aa7ff" stroke-width="2" stroke-linecap="round"/>
          </g>

          <g class="part-head" data-x="120" data-y="83">
            <g class="female-only">
              <circle class="rig-part skin" cx="-38" cy="5" r="9"/>
              <circle class="rig-part skin" cx="38" cy="5" r="9"/>
              <path class="rig-part skin-light" d="M-39 -20 C-40 -40 -24 -53 0 -53 C25 -53 40 -39 39 -18 L37 11 C34 34 19 45 0 45 C-20 45 -34 34 -37 11 Z"/>
              <path class="rig-part hair" d="M-43 -16 C-43 -47 -27 -64 1 -65 C30 -64 44 -46 42 -15 C33 -31 20 -34 8 -33 C-2 -23 -18 -17 -38 -15 Z"/>
              <path class="rig-part hair" d="M-37 -10 C-28 -12 -18 -19 -10 -29 C-7 -20 5 -15 18 -17 C27 -18 34 -14 39 -8 L42 -28 C37 -53 20 -65 -2 -64 C-27 -63 -42 -47 -43 -21 Z"/>
              <path class="hair-highlight" d="M-24 -45 C-14 -53 0 -56 14 -51"/>
            </g>
            <g class="male-only">
              <circle class="rig-part skin" cx="-34" cy="4" r="8"/>
              <circle class="rig-part skin" cx="34" cy="4" r="8"/>
              <path class="rig-part skin-light" d="M-36 -16 C-34 -39 -18 -52 1 -53 C22 -53 37 -41 36 -18 L34 12 C31 33 17 43 0 44 C-18 44 -31 33 -34 13 Z"/>
              <path class="rig-part hair" d="M-40 -18 C-40 -44 -22 -61 1 -61 C25 -61 41 -45 40 -18 C29 -31 18 -34 5 -34 C-6 -29 -20 -22 -39 -18 Z"/>
              <path class="rig-part hair" d="M-28 -38 C-18 -52 -4 -58 12 -58 C22 -58 31 -53 38 -45 C31 -44 26 -40 20 -35 C14 -29 5 -25 -5 -23 C-14 -20 -21 -15 -29 -8 C-35 -14 -36 -26 -28 -38 Z"/>
              <path class="hair-highlight" d="M-18 -47 C-8 -55 6 -57 20 -52"/>
            </g>
            <ellipse class="eye-open" cx="-14" cy="3" rx="4" ry="6"/>
            <ellipse class="eye-open" cx="14" cy="3" rx="4" ry="6"/>
            <path class="eye-closed" d="M-19 3 Q-14 7 -9 3"/>
            <path class="eye-closed" d="M9 3 Q14 7 19 3"/>
            <path class="mouth" d="M-7 23 Q0 28 7 23"/>
          </g>
        </g>
      </svg>`;
  }

  _buildRig() {
    this.element = document.createElement("div");
    this.element.className = "rig-actor";
    this.element.innerHTML = OfficeCharacter.svgMarkup();
    this.svg = this.element.querySelector(".rig-svg");
    this.parts = {
      body: this.element.querySelector(".part-body"),
      head: this.element.querySelector(".part-head"),
      armLeft: this.element.querySelector(".part-arm-left"),
      armRight: this.element.querySelector(".part-arm-right"),
      forearmLeft: this.element.querySelector(".part-forearm-left"),
      forearmRight: this.element.querySelector(".part-forearm-right"),
      legLeft: this.element.querySelector(".part-leg-left"),
      legRight: this.element.querySelector(".part-leg-right"),
      calfLeft: this.element.querySelector(".part-calf-left"),
      calfRight: this.element.querySelector(".part-calf-right")
    };
    this.applyPalette();
    this.setGender(this.gender);
    this.element.addEventListener("pointerdown", event => {
      event.stopPropagation();
      this.scene.selectCharacter(this);
      updateSidePanel(this.scene);
    });
    this.scene.characterLayer.appendChild(this.element);
  }

  applyPalette() {
    if (!this.element) return;
    this.element.style.setProperty("--jacket", this.palette.jacket);
    this.element.style.setProperty("--jacket-light", this.palette.jacketLight);
    this.element.style.setProperty("--pants", this.palette.pants);
    this.element.style.setProperty("--hair", this.palette.hair);
    this.element.style.setProperty("--hair-highlight", this.palette.hairHighlight);
    this.element.style.setProperty("--skin", this.palette.skin);
    this.element.style.setProperty("--skin-dark", this.palette.skinDark);
  }

  setGender(gender) {
    this.gender = gender;
    if (this.element) this.element.dataset.gender = gender;
  }

  currentCell() {
    return this.scene.navigation.worldToCell(this.x, this.y);
  }

  setTarget(x, y, manual = false) {
    const targetCell = this.scene.navigation.worldToCell(x, y);
    const path = this.scene.navigation.findPath(this.currentCell(), targetCell);
    if (path.length > 0) {
      this.path = path;
      this.pathIndex = Math.min(1, path.length - 1);
      if (manual) this.manualHold = 5;
      return true;
    }
    return false;
  }

  update(delta) {
    this.walkTime += delta;
    this.manualHold = Math.max(0, this.manualHold - delta);

    if (this.path.length === 0 || this.pathIndex >= this.path.length) {
      this.path = [];
      this.pathIndex = 0;
      this.roamTimer -= delta;
      if (this.scene.autoRoam && this.manualHold <= 0 && this.roamTimer <= 0) {
        const target = this.scene.randomWalkablePoint();
        if (target) this.setTarget(target.x, target.y);
        this.roamTimer = 2.5 + Math.random() * 4;
      }
      return;
    }

    const target = this.path[this.pathIndex];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 2) {
      this.x = target.x;
      this.y = target.y;
      this.pathIndex += 1;
      if (this.pathIndex >= this.path.length) {
        this.path = [];
        this.pathIndex = 0;
      }
      return;
    }

    const amount = Math.min(distance, this.speed * delta);
    this.x += (dx / distance) * amount;
    this.y += (dy / distance) * amount;
  }

  setPartTransform(node, angle = 0, x = 0, y = 0) {
    const baseX = Number(node.dataset.x || 0);
    const baseY = Number(node.dataset.y || 0);
    node.setAttribute("transform", `translate(${baseX + x} ${baseY + y}) rotate(${angle})`);
  }

  applyPose(time) {
    const t = time / 1000;
    const action = this.path.length > 0 ? "walk" : "idle";

    let bob = 0, torso = 0, head = 0, headY = 0;
    let armLeft = 0, armRight = 0, elbowLeft = 0, elbowRight = 0;
    let legLeft = 0, legRight = 0, kneeLeft = 0, kneeRight = 0;
    let legLeftX = -1, legRightX = 1, legLeftY = 0, legRightY = 0;
    let calfLeftX = -1, calfRightX = 1, calfLeftY = 0, calfRightY = 0;

    if (action === "idle") {
      const breath = Math.sin(t * 2.1);
      bob = breath * 1.1;
      head = Math.sin(t * 1.25) * 1.1;
      headY = breath * -0.45;
      armLeft = -2 + breath * 1.1;
      armRight = 2 - breath * 1.1;
      elbowLeft = -1.5;
      elbowRight = 1.5;
    }

    if (action === "walk") {
      const cycle = t * 6.4;
      const swing = Math.sin(cycle);
      const counter = -swing;
      const liftLeft = Math.max(0, -swing);
      const liftRight = Math.max(0, swing);
      bob = -Math.abs(Math.sin(cycle)) * 2.1;
      torso = Math.sin(cycle * 0.5) * 0.7;
      head = Math.sin(cycle * 0.5) * 0.55;
      headY = -Math.abs(Math.sin(cycle)) * 0.3;
      armLeft = counter * 12;
      armRight = swing * 12;
      elbowLeft = 4 + Math.max(0, swing) * 7;
      elbowRight = 4 + Math.max(0, -swing) * 7;
      legLeft = swing * 3.8;
      legRight = counter * 3.8;
      legLeftX = -4 - liftLeft * 2.2;
      legRightX = 4 + liftRight * 2.2;
      legLeftY = -liftLeft * 4.8;
      legRightY = -liftRight * 4.8;
      kneeLeft = liftLeft * 12;
      kneeRight = liftRight * 12;
      calfLeftX = -1.6;
      calfRightX = 1.6;
      calfLeftY = -liftLeft * 1.3;
      calfRightY = -liftRight * 1.3;
    }

    this.parts.body.setAttribute("transform", `translate(0 ${bob}) rotate(${torso} 120 188)`);
    this.setPartTransform(this.parts.head, head, 0, headY);
    this.setPartTransform(this.parts.armLeft, armLeft);
    this.setPartTransform(this.parts.armRight, armRight);
    this.setPartTransform(this.parts.forearmLeft, elbowLeft);
    this.setPartTransform(this.parts.forearmRight, elbowRight);
    this.setPartTransform(this.parts.legLeft, legLeft, legLeftX, legLeftY);
    this.setPartTransform(this.parts.legRight, legRight, legRightX, legRightY);
    this.setPartTransform(this.parts.calfLeft, kneeLeft, calfLeftX, calfLeftY);
    this.setPartTransform(this.parts.calfRight, kneeRight, calfRightX, calfRightY);
    this.element.classList.toggle("blink", time % 4400 > 4250);
  }

  updateDOM(view, time) {
    if (!this.element) return;
    this.applyPose(time);
    this.element.classList.toggle("selected", this.selected);
    const screenX = view.offsetX + this.x * view.scale;
    const screenY = view.offsetY + this.y * view.scale;
    const actorScale = this.scale * view.scale * 0.42;
    this.element.style.left = `${screenX}px`;
    this.element.style.top = `${screenY}px`;
    this.element.style.setProperty("--actor-scale", actorScale.toFixed(4));
    this.element.style.zIndex = String(20 + Math.round(this.y));
  }

  draw() {}

  containsPoint(x, y) {
    return Math.abs(x - this.x) < 22 && Math.abs(y - this.y) < 42;
  }
}
